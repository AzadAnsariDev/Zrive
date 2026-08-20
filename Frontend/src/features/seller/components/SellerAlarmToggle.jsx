import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Volume2, VolumeX, Bell, BellOff, Play, Send, ChevronDown } from 'lucide-react'
import {
    toggleAlarmMute,
    setPushNotificationsEnabled,
    setPushPermissionStatus
} from '../state/notificationSlice'
import {
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    getNotificationPermissionStatus,
    playAlarmAudio,
    triggerTestPushBackend,
    showSellerAlarmNotification
} from '../services/push-notification.service.js'
import { toast } from 'sonner'

/**
 * Alarm & Notification Control Component
 * Controls both in-app audio alarm and real background push notifications
 */
const SellerAlarmToggle = ({ compact = false }) => {
    const dispatch = useDispatch()
    const { alarmMuted, pushNotificationsEnabled, pushPermissionStatus, unreadOrdersCount } = useSelector(state => state.notification)
    const [loadingPush, setLoadingPush] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Check notification permission status on mount
    useEffect(() => {
        const status = getNotificationPermissionStatus()
        dispatch(setPushPermissionStatus(status))
    }, [dispatch])

    const handleToggleAlarm = () => {
        dispatch(toggleAlarmMute())
        if (alarmMuted) {
            toast.success('🔊 Alarm sound enabled for new orders')
        } else {
            toast.info('🔇 Alarm sound muted')
        }
    }

    const handleTogglePushNotifications = async () => {
        setLoadingPush(true)
        try {
            if (!pushNotificationsEnabled || pushPermissionStatus !== 'granted') {
                // User is enabling push notifications - subscribe to Web Push
                const result = await subscribeToPushNotifications()
                if (result.success) {
                    dispatch(setPushNotificationsEnabled(true))
                    dispatch(setPushPermissionStatus('granted'))
                    toast.success('🔔 Background push notifications enabled!')
                } else if (result.reason === 'permission_denied') {
                    dispatch(setPushPermissionStatus('denied'))
                    dispatch(setPushNotificationsEnabled(false))
                    toast.error('❌ Notification permission denied in browser.')
                } else {
                    toast.error(result.error || 'Failed to enable push notifications')
                }
            } else {
                // User is disabling push notifications
                await unsubscribeFromPushNotifications()
                dispatch(setPushNotificationsEnabled(false))
                toast.info('🔕 Background push notifications disabled')
            }
        } catch (err) {
            console.error('Error toggling push notifications:', err)
        } finally {
            setLoadingPush(false)
        }
    }

    const handleTestAlarmSound = () => {
        playAlarmAudio(5)
        toast.success('🔊 Playing 5-second alarm sound test!')
    }

    const handleTestPushNotification = async () => {
        // Direct browser notification
        showSellerAlarmNotification({
            orderId: 'TEST-884920',
            orderAmount: 1999,
            buyerLocation: 'Mumbai'
        })

        // Backend Web Push notification (delivers via Service Worker)
        const res = await triggerTestPushBackend()
        if (res.sent) {
            toast.success('📱 Test push notification sent to your browser!')
        } else {
            toast.info(res.message || 'Push test sent')
        }
    }

    const isPushActive = pushNotificationsEnabled && pushPermissionStatus === 'granted'

    if (compact) {
        return (
            <div className="flex items-center gap-1.5">
                {/* Audio Alarm Toggle */}
                <button
                    onClick={handleToggleAlarm}
                    className="relative p-2 rounded-lg transition-colors hover:bg-[#f0f0f0]"
                    title={alarmMuted ? "In-app alarm is muted (Click to enable)" : "In-app alarm is active (Click to mute)"}
                    aria-label={alarmMuted ? "Unmute alarm" : "Mute alarm"}
                >
                    {alarmMuted ? (
                        <VolumeX size={18} className="text-[#999]" />
                    ) : (
                        <Volume2 size={18} className="text-[#287a4b]" />
                    )}
                </button>

                {/* Push Notification Toggle */}
                <button
                    onClick={handleTogglePushNotifications}
                    disabled={loadingPush}
                    className="relative p-2 rounded-lg transition-colors hover:bg-[#f0f0f0]"
                    title={isPushActive ? "Push notifications enabled (works offline/closed tab)" : "Push notifications disabled (Click to enable)"}
                    aria-label={isPushActive ? "Disable notifications" : "Enable notifications"}
                >
                    {isPushActive ? (
                        <Bell size={18} className="text-[#287a4b]" />
                    ) : (
                        <BellOff size={18} className="text-[#999]" />
                    )}
                </button>

                {unreadOrdersCount > 0 && (
                    <span className="bg-[#c43d3d] text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {Math.min(unreadOrdersCount, 9)}
                    </span>
                )}
            </div>
        )
    }

    return (
        <div className="rounded-[8px] border border-[#EAEAEA] bg-[#FAFAFA] overflow-hidden transition-all shadow-sm">
            {/* Header / Trigger Accordion Button */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F2F2F2] transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#B08D57]/30 flex items-center justify-center text-[#B08D57] shrink-0">
                        <Bell size={15} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[12.5px] font-bold text-[#111]">Order Alarm & Push Notifications</span>
                            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                !alarmMuted ? 'bg-[#EAF5EE] text-[#287A4B]' : 'bg-[#F5EFE5] text-[#999]'
                            }`}>
                                {!alarmMuted ? 'Audio Active' : 'Muted'}
                            </span>
                            <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isPushActive ? 'bg-[#EAF5EE] text-[#287A4B]' : 'bg-[#F2F2F2] text-[#888]'
                            }`}>
                                {isPushActive ? 'Push Live' : 'Push Off'}
                            </span>
                        </div>
                        <p className="text-[11px] text-[#777] truncate mt-0.5">
                            Set up real-time audio alerts & background push notifications for instant order arrivals
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-3 text-[#777]">
                    <span className="text-[11px] font-semibold hidden sm:inline">
                        {isOpen ? 'Hide Settings' : 'Configure'}
                    </span>
                    <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#B08D57]' : ''}`}
                    />
                </div>
            </button>

            {/* Collapsible Content */}
            {isOpen && (
                <div className="p-4 pt-2 border-t border-[#EAEAEA] space-y-3 bg-white animate-fade-in-down">
                    {/* In-app Audio Alarm Control */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[6px] border border-[#EAEAEA] bg-[#FAFAFA] px-4 py-3">
                        <div className="flex items-center gap-3 flex-1">
                            {alarmMuted ? (
                                <>
                                    <VolumeX size={18} className="text-[#999] shrink-0" />
                                    <div>
                                        <span className="text-[12px] font-semibold text-[#666]">In-app Audio Alarm: Muted</span>
                                        <span className="text-[11px] text-[#999] block">(Alarm sound will not play on new order)</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Volume2 size={18} className="text-[#287A4B] shrink-0" />
                                    <div>
                                        <span className="text-[12px] font-semibold text-[#287A4B]">In-app Audio Alarm: Active</span>
                                        <span className="text-[11px] text-[#555] block">(Loud 5-second pulsating alert tone when order arrives)</span>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleTestAlarmSound}
                                type="button"
                                className="flex items-center gap-1 px-3 py-1.5 rounded border border-[#DDD] bg-white text-[#333] text-[11px] font-semibold hover:bg-[#F0F0F0] transition-all cursor-pointer"
                                title="Test alarm sound"
                            >
                                <Play size={12} />
                                Test Sound
                            </button>
                            <button
                                onClick={handleToggleAlarm}
                                className={`px-3.5 py-1.5 rounded text-[11px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                                    alarmMuted
                                        ? 'bg-[#111] text-white hover:bg-[#B08D57]'
                                        : 'bg-[#EAEAEA] text-[#111] hover:bg-[#DDD]'
                                }`}
                            >
                                {alarmMuted ? 'Enable Sound' : 'Mute'}
                            </button>
                        </div>
                    </div>

                    {/* Push Notification Control */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[6px] border border-[#EAEAEA] bg-[#FAFAFA] px-4 py-3">
                        <div className="flex items-center gap-3 flex-1">
                            {isPushActive ? (
                                <>
                                    <Bell size={18} className="text-[#287A4B] shrink-0" />
                                    <div>
                                        <span className="text-[12px] font-semibold text-[#287A4B]">Background Push Notifications: Enabled</span>
                                        <span className="text-[11px] text-[#555] block">(Works offline, in background, and even when tab is closed)</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <BellOff size={18} className="text-[#999] shrink-0" />
                                    <div>
                                        <span className="text-[12px] font-semibold text-[#666]">Background Push Notifications: Disabled</span>
                                        {pushPermissionStatus === 'denied' ? (
                                            <span className="text-[11px] text-[#C43D3D] block">Browser permission denied - enable in address bar lock icon</span>
                                        ) : (
                                            <span className="text-[11px] text-[#999] block">(Enable to receive instant order alerts even when tab is closed)</span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {isPushActive && (
                                <button
                                    onClick={handleTestPushNotification}
                                    type="button"
                                    className="flex items-center gap-1 px-3 py-1.5 rounded border border-[#DDD] bg-white text-[#333] text-[11px] font-semibold hover:bg-[#F0F0F0] transition-all cursor-pointer"
                                    title="Test background push notification"
                                >
                                    <Send size={12} />
                                    Test Push
                                </button>
                            )}
                            <button
                                onClick={handleTogglePushNotifications}
                                disabled={loadingPush || pushPermissionStatus === 'denied'}
                                className={`px-3.5 py-1.5 rounded text-[11px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                                    isPushActive
                                        ? 'bg-[#EAEAEA] text-[#111] hover:bg-[#DDD]'
                                        : 'bg-[#111] text-white hover:bg-[#B08D57]'
                                }`}
                            >
                                {loadingPush ? 'Setting up...' : isPushActive ? 'Disable' : 'Enable & Subscribe'}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-[6px] bg-[#EAF5EE] border border-[#287A4B]/20 px-3.5 py-2.5">
                        <p className="text-[11.5px] text-[#287A4B] font-medium leading-relaxed">
                            💡 <strong>Pro-Tip:</strong> Click <strong>"Enable & Subscribe"</strong> and allow browser notifications so you get native Chrome alerts & vibrations for new orders even when your browser tab is closed.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SellerAlarmToggle
