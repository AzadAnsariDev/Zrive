import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router'
import { useSelector } from 'react-redux'
import { Eye, EyeOff, Lock, Mail, X, Shield, ArrowLeft } from 'lucide-react'
import { useAdmin } from '../hook/useAdmin'

const ForgotPasswordModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-[420px] rounded-[10px] bg-[#111111] border border-[#B08D57]/40 shadow-2xl p-7 text-white">
      <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
        <X size={18} />
      </button>
      <h3 className="font-display text-[20px] font-bold text-white mb-2">Reset Admin Credentials</h3>
      <p className="text-[13px] leading-relaxed text-white/70 mb-4">
        Admin passwords must be reset via server terminal command:
      </p>
      <code className="block rounded-[6px] bg-black text-[#D4B982] text-[12px] p-3.5 mb-4 font-mono border border-white/10">
        node scripts/resetAdminPassword.js &lt;newPassword&gt;
      </code>
      <p className="text-[11.5px] text-white/50">
        Contact the system administrator if you do not have SSH terminal access.
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
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col items-center justify-center px-6 relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-[12px] text-white/60 hover:text-white transition-colors">
        <ArrowLeft size={16} />
        Back to ZRIVE Marketplace
      </Link>

      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#B08D57]/15 border border-[#B08D57]/40 flex items-center justify-center mx-auto mb-4">
            <Shield size={26} className="text-[#B08D57]" />
          </div>
          <h1 className="font-display text-[28px] font-bold text-white tracking-wide">ZRIVE</h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B08D57] mt-1">Admin Control Panel</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="rounded-[12px] border border-white/10 bg-[#131313] p-8 shadow-2xl space-y-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#B08D57] mb-2">Admin Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                placeholder="admin@zrive.com"
                className="w-full rounded-[6px] border border-white/15 bg-[#1c1b1b] pl-10 pr-4 py-3 text-[13.5px] text-white placeholder:text-white/30 outline-none focus:border-[#B08D57]"
                {...register('email', { required: 'Email is required' })}
              />
            </div>
            {errors.email && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#B08D57] mb-2">Security Key / Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full rounded-[6px] border border-white/15 bg-[#1c1b1b] pl-10 pr-10 py-3 text-[13.5px] text-white placeholder:text-white/30 outline-none focus:border-[#B08D57]"
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.password.message}</p>}
          </div>

          {error && <p className="text-[12px] text-[#C43D3D] bg-[#C43D3D]/10 p-2.5 rounded border border-[#C43D3D]/30">{error}</p>}

          <button
            type="submit"
            disabled={loading?.create}
            className="w-full rounded-[6px] bg-[#B08D57] py-3.5 text-[12px] font-bold tracking-[0.08em] uppercase text-[#0e0e0e] hover:bg-[#D4B982] transition-colors disabled:opacity-60 shadow-lg"
          >
            {loading?.create ? 'Authenticating...' : 'Sign In to Console'}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-[11px] text-white/50 hover:text-[#B08D57] transition-colors"
            >
              Forgotten admin password?
            </button>
          </div>
        </form>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  )
}

export default AdminLogin