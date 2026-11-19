const MAP = {
  'auth/invalid-email': "Email manzili noto'g'ri.",
  'auth/user-not-found': 'Bunday foydalanuvchi topilmadi.',
  'auth/wrong-password': "Parol noto'g'ri.",
  'auth/invalid-credential': "Email yoki parol noto'g'ri.",
  'auth/email-already-in-use': "Bu email allaqachon ro'yxatdan o'tgan.",
  'auth/weak-password': 'Parol juda oddiy (kamida 6 ta belgi).',
  'auth/too-many-requests': "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.",
  'auth/popup-closed-by-user': 'Google oynasi yopildi.',
  'auth/popup-blocked': 'Brauzer Google oynasini blokladi. Ruxsat bering.',
  'auth/network-request-failed': "Internet aloqasi yo'q.",
  'auth/operation-not-allowed': "Firebase Console'da bu kirish usuli yoqilmagan.",
}
export const authMessage = (e) => MAP[e?.code] || "Xatolik yuz berdi. Qayta urinib ko'ring."
