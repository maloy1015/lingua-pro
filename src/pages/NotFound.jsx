import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="gradient-text font-display text-8xl font-extrabold">404</p>
        <p className="mt-2 text-slate-400">Sahifa topilmadi.</p>
        <Link to="/dashboard" className="btn-primary mt-6">Bosh sahifaga</Link>
      </div>
    </div>
  )
}
