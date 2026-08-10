import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { Eye, EyeOff, Lock, Mail, X } from 'lucide-react'
import { useAdmin } from '../hook/useAdmin'

const inputClasses =
  'w-full rounded-[3px] border border-border bg-cream-dark px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-soft outline-none focus:border-ink transition-colors'
const labelClasses = 'block text-[11px] font-semibold tracking-[0.06em] text-gold mb-1.5'
const errorClasses = 'text-[11.5px] text-error mt-1'

const ForgotPasswordModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
    <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-[400px] rounded-[3px] bg-surface border border-border shadow-xl p-7">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-ink-soft hover:text-ink transition-colors">
        <X size={16} />
      </button>
      <h3 className="font-display text-[18px] font-medium text-ink mb-2">Reset Admin Password</h3>
      <p className="text-[13px] leading-relaxed text-ink-soft mb-4">
        Admin password reset yahan se nahi hota. Backend access wale machine pe ye command chalao:
      </p>
      <code className="block rounded-[3px] bg-charcoal text-cream text-[12px] px-3.5 py-3 mb-4 overflow-x-auto">
        node scripts/resetAdminPassword.js &lt;newPassword&gt;
      </code>
      <p className="text-[12px] text-ink-soft">
        Agar backend access nahi hai, jo manage karta hai usse contact karo.
      </p>
    </div>
  </div>
)

const AdminLogin = () => {
  const [showForgot, setShowForgot] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { handleAdminLogin } = useAdmin()
  const { loading, error } = useSelector((state) => state.admin)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data) => {
    const success = await handleAdminLogin(data)
    if (success) navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-[380px]">
        <div className="text-center mb-8">
          <h1 className="font-display text-[26px] font-semibold text-ink tracking-tight">ZRIVE</h1>
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft mt-1">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-[3px] border border-border bg-surface p-7 space-y-4">
          <div>
            <label className={labelClasses}>Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="email"
                placeholder="admin@zrive.com"
                className={`${inputClasses} pl-10`}
                {...register('email', { required: 'Email is required' })}
              />
            </div>
            {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
          </div>

          <div>
            <label className={labelClasses}>Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`${inputClasses} pl-10 pr-10`}
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className={errorClasses}>{errors.password.message}</p>}
          </div>

          {error && <p className={errorClasses}>{error}</p>}

          <button
            type="submit"
            disabled={loading.create}
            className="w-full rounded-[3px] bg-charcoal py-3 text-[11px] font-semibold tracking-[0.1em] uppercase text-cream transition-colors hover:bg-ink disabled:opacity-60"
          >
            {loading.create ? 'Signing in...' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="w-full text-center text-[12px] text-ink-soft hover:text-ink transition-colors"
          >
            Forgot password?
          </button>
        </form>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  )
}

export default AdminLogin