const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { createClient } = require('@supabase/supabase-js');

// بيانات سوبابيز (جيبها من Settings > API في سوبابيز)
// الكود حيقرأ المفاتيح من السيرفر مباشرة
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const client = new Client({
	authStrategy: new LocalAuth(),
						  puppeteer: { args: ['--no-sandbox'] } // ضروري عشان يشتغل في Railway
});

client.on('qr', qr => {
	qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
	console.log('بوت الوسيط جاهز لتفعيل المستخدمين! 🚀');
});

client.on('message', async msg => {
	if (msg.body.includes('تفعيل تطبيق الوسيط')) {
		const lines = msg.body.split('\n');
		try {
			const userPhone = lines[1].split(': ')[1].trim();
			const otpCode = lines[2].split(': ')[1].trim();
			const senderNumber = msg.from.replace('@c.us', '');
			
			// التحقق من الرقم والكود
			const { data, error } = await supabase
			.from('profiles')
			.update({ is_verified: true })
			.match({ phone: userPhone, otp_code: otpCode })
			.select();
			
			if (data && data.length > 0) {
				msg.reply('أبشر! تم تفعيل حسابك بنجاح في تطبيق الوسيط ✅.');
			} else {
				msg.reply('عذراً، الكود غير صحيح أو الرقم غير مسجل ❌');
			}
		} catch (e) {
			console.log('خطأ في معالجة الرسالة');
		}
	}
});

client.initialize();
