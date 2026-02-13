const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getMessaging } = require('firebase-admin/messaging')
const { logger } = require('firebase-functions')

initializeApp()

/**
 * Cloud Function: sendPushNotification
 *
 * Triggers when a new document is created in the 'notifications' collection.
 * Looks up the recipient's FCM tokens and sends a push notification to all their devices.
 */
exports.sendPushNotification = onDocumentCreated(
  {
    document: 'notifications/{notifId}',
    region: 'asia-southeast1'
  },
  async (event) => {
    const notifData = event.data.data()
    const { recipientEmail, type, title, message } = notifData

    if (!recipientEmail) {
      logger.warn('Notification missing recipientEmail, skipping push.')
      return
    }

    // Look up recipient's FCM tokens
    const db = getFirestore()
    const tokensSnap = await db
      .collection('fcmTokens')
      .where('email', '==', recipientEmail)
      .get()

    if (tokensSnap.empty) {
      logger.info(`No FCM tokens found for ${recipientEmail}, skipping push.`)
      return
    }

    const tokens = tokensSnap.docs.map((d) => d.data().token).filter(Boolean)

    if (tokens.length === 0) {
      logger.info(`All FCM tokens empty for ${recipientEmail}, skipping push.`)
      return
    }

    // Determine the navigation URL based on notification type
    let clickUrl = '/'
    if (['expense_submitted', 'expense_rejected', 'expense_approved', 'expense_paid'].includes(type)) {
      clickUrl = '/#/expenses'
    } else if (['leave_submitted', 'leave_approved', 'leave_rejected'].includes(type)) {
      clickUrl = '/#/leaves'
    } else if (notifData.projectId) {
      clickUrl = `/#/project/${notifData.projectId}`
    }

    // Build the FCM message
    const pushMessage = {
      tokens,
      notification: {
        title: title || 'การแจ้งเตือนใหม่',
        body: message || ''
      },
      data: {
        type: type || '',
        notifId: event.params.notifId,
        projectId: notifData.projectId || '',
        url: clickUrl
      },
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-128x128.png',
          vibrate: [200, 100, 200]
        },
        fcmOptions: {
          link: clickUrl
        }
      }
    }

    try {
      const messaging = getMessaging()
      const response = await messaging.sendEachForMulticast(pushMessage)

      logger.info(
        `Push sent to ${recipientEmail}: ${response.successCount} success, ${response.failureCount} failure`
      )

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        const tokensToRemove = []
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code
            // Remove tokens that are no longer valid
            if (
              errorCode === 'messaging/registration-token-not-registered' ||
              errorCode === 'messaging/invalid-registration-token'
            ) {
              tokensToRemove.push(tokens[idx])
            }
            logger.warn(`Failed to send to token ${idx}: ${resp.error?.message}`)
          }
        })

        // Delete stale tokens from Firestore
        if (tokensToRemove.length > 0) {
          const batch = db.batch()
          for (const staleToken of tokensToRemove) {
            const staleSnap = await db
              .collection('fcmTokens')
              .where('token', '==', staleToken)
              .get()
            staleSnap.docs.forEach((d) => batch.delete(d.ref))
          }
          await batch.commit()
          logger.info(`Cleaned up ${tokensToRemove.length} stale FCM tokens.`)
        }
      }
    } catch (err) {
      logger.error('Error sending push notification:', err)
    }
  }
)
