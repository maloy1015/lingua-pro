export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
export function validateRegister({ name, email, password, confirm }) {
  const e = {}
  if (name.trim().length < 3) e.name = "Ism kamida 3 ta belgidan iborat bo'lsin."
  if (!isEmail(email)) e.email = "To'g'ri email kiriting."
  if (password.length < 6) e.password = 'Parol kamida 6 ta belgi.'
  if (confirm !== password) e.confirm = 'Parollar mos kelmadi.'
  return e
}
export function validateLogin({ email, password }) {
  const e = {}
  if (!isEmail(email)) e.email = "To'g'ri email kiriting."
  if (!password) e.password = 'Parolni kiriting.'
  return e
}
