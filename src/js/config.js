/**
 * RRU School Portal - Global Configuration
 */

export const CONFIG = {
  // Replace with your Google Apps Script Web App Deployment URL
  // Example: https://script.google.com/macros/s/AKfycb.../exec
  GAS_API_URL: 'https://script.google.com/macros/s/AKfycbwcd_XDkJzj38Pn3BR9Lmzg4UdDbBwe_D_WKVVxO8G3xsu4fI0Lu3vV5Y1hfqNG2LFEkg/exec',

  SPREADSHEET_ID: '1BgKm3XODUIBZNkxMGUWbEGBlxYRNYi_Z2YxoCu9XQ3M',
  SCRIPT_ID: '1XsqUQrMGNawiUWrtoMhetapokBqT26V4voFfSh0UpYP-h4Ff47bhYhHP',

  SCHOOL: {
    name: 'โรงเรียนรัฐราษฎร์อุปถัมภ์',
    shortName: 'RRU',
    subtitle: 'ระบบรวมงานและบริการสารสนเทศออนไลน์ (All-in-One Portal)',
    logoDefault: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Seal_of_the_Ministry_of_Education_of_Thailand.svg/200px-Seal_of_the_Ministry_of_Education_of_Thailand.svg.png'
  },

  DEPARTMENTS: [
    {
      id: 'academic',
      name: 'กลุ่มบริหารวิชาการ',
      shortName: 'วิชาการ',
      icon: 'graduation-cap',
      color: 'from-pink-500 to-rose-500',
      description: 'งานวัดผล ตารางสอน แผนการเรียน และระบบวิชาการ'
    },
    {
      id: 'student-affairs',
      name: 'กลุ่มบริหารกิจการนักเรียน',
      shortName: 'กิจการนักเรียน',
      icon: 'users',
      color: 'from-purple-500 to-indigo-500',
      description: 'ระบบพฤติกรรม มาสาย เครื่องแต่งกาย และวินัยนักเรียน'
    },
    {
      id: 'budget',
      name: 'กลุ่มบริหารงบประมาณ',
      shortName: 'งบประมาณ',
      icon: 'wallet',
      color: 'from-fuchsia-500 to-pink-600',
      description: 'พัสดุ การเงิน แผนงาน และงบประมาณสถานศึกษา'
    },
    {
      id: 'general',
      name: 'กลุ่มบริหารทั่วไป',
      shortName: 'บริหารทั่วไป',
      icon: 'building-2',
      color: 'from-violet-500 to-purple-600',
      description: 'อาคารสถานที่ ประชาสัมพันธ์ และสารบรรณกลาง'
    },
    {
      id: 'personnel',
      name: 'กลุ่มบริหารงานบุคคล',
      shortName: 'บริหารงานบุคคล',
      icon: 'user-cog',
      color: 'from-purple-600 to-pink-500',
      description: 'งานครูและบุคลากร ประเมินผล และการลา'
    }
  ],

  ROLES: [
    { id: 'all', label: 'ทั้งหมด', icon: 'layout-grid' },
    { id: 'student', label: 'นักเรียน', icon: 'backpack' },
    { id: 'parent', label: 'ผู้ปกครอง', icon: 'heart-handshake' },
    { id: 'teacher', label: 'ครู / บุคลากร', icon: 'briefcase' }
  ]
};
