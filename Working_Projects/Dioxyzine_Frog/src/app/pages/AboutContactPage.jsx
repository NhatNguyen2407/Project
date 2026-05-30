import { motion } from 'motion/react';
import { Heart, Sparkles, Users, Award, Mail, MapPin, Clock, Facebook, Instagram } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const translations = {
  vi: {
    heroTitle: 'Về Dioxyzine Frog',
    heroSub: 'Xưởng sản xuất và studio thiết kế chuyên về fanmerch, merchandise custom, quà tặng handmade độc quyền làm từ vải và nhồi bông. Đem lại sản phẩm giá tốt nhất cho các họa sĩ và doanh nghiệp. Hiện thực hóa mọi ý tưởng của bạn.',
    socialHead: 'Theo dõi chúng tôi ngay tại:',
    storyTitle: 'Câu Chuyện Của Chúng Tôi',
    storyP1: 'Được thành lập bởi 1 họa sĩ độc lập, Dioxyzine Frog ra đời từ niềm yêu thích dành cho những nhân vật 2D từ phim truyện và mong muốn được đem họ ra ngoài đời. Chúng tôi thấu hiểu sâu sắc khó khăn của các tác giả khi tìm kiếm một xưởng may uy tín, hiểu đúng ý tưởng của bạn mà không yêu cầu đặt số lượng tới hàng nghìn cái với chi phí quá đắt đỏ.',
    storyP2: 'Sứ mệnh của chúng tôi chính là: Bình dân hóa quy trình may mẫu custom cao cấp, đưa dịch vụ sản xuất merchandise đến gần hơn với mọi nhà sáng tạo và doanh nghiệp. Dù bạn muốn đặt số lượng ít để làm quà tặng độc bản hay may hàng loạt để thương mại hóa, chúng tôi đều sẽ cố gắng hết sức để biến nó thành sự thật.',
    philosophyTitle: 'Triết Lý Sắp Đặt',
    philosophySub: 'Sáng tạo bằng tâm huyết, gia công tận tụy bằng tay nghề thủ công',
    philosophies: [
      { title: 'Đong Đầy Yêu Thương', desc: 'Mỗi sản phẩm xuất xưởng đều được nhồi bông căng phồng béo tròn ôm cực thích.' },
      { title: 'Sáng Tạo Tự Do', desc: 'Tôn trọng tối đa tỷ lệ rập và biểu cảm nhân vật của bạn, không rập khuôn máy móc.' },
      { title: 'Vì Cộng Đồng', desc: 'Bảng giá hỗ trợ tối đa cho các bạn artist và doanh nghiệp sản xuất số lượng ít.' },
      { title: 'Đảm Bảo Chất Lượng', desc: 'Lựa chọn dòng vải Velboa, lông nhung 1mm cao cấp nhất, chỉ thêu sắc nét.' }
    ],
    processTitle: 'Các Bước May Đo',
    processSub: 'Quy trình khép kín, minh bạch và chuyên nghiệp',
    processes: [
      { step: '01', title: 'Tư Vấn Ý Tưởng', desc: 'Chúng tôi tiếp nhận file hình ảnh 2D, lắng nghe mong muốn về size và loại hình.' },
      { step: '02', title: 'Báo Giá Chi Tiết', desc: 'Tính toán chi phí minh bạch. Cọc từ 50% hóa đơn để chúng tôi tiến hành làm rập.' },
      { step: '03', title: 'Duyệt Ảnh Sản Xuất', desc: 'Chúng tôi tiến hành in/thêu và gửi ảnh cập nhật liên tục cho bạn duyệt dáng.' },
      { step: '04', title: 'Sản Xuất May Loạt', desc: 'Đội ngũ thợ may tay thủ công lành nghề của chúng tôi khâu ráp tỉ mỉ toàn bộ đơn hàng.' },
      { step: '05', title: 'Kiểm Tra Chất Lượng', desc: 'Từng sản phẩm đều được kiểm tra lỗi chỉ thừa, căn chỉnh biểu cảm trước khi đóng gói.' },
      { step: '06', title: 'Đóng Gói & Giao Hàng', desc: 'Đóng kiện cẩn thận, dán mã tracking và giao hàng nhanh toàn quốc/quốc tế.' }
    ],
    faqTitle: 'Câu Hỏi Thường Gặp',
    faqSub: 'Giải đáp nhanh thắc mắc của bạn về quy trình sản xuất',
    faqs: [
      { question: 'Số lượng đặt hàng tối thiểu (MOQ) là bao nhiêu?', answer: 'Tại Dioxyzine Frog, chúng tôi hỗ trợ sản xuất từ 10 cái/mẫu đối với tất cả loại sản phẩm có listing. Với các sản phẩm lên ý tưởng riêng theo yêu cầu, chúng tôi hỗ trợ sản xuất từ 30 cái/mẫu. Sẽ có những đợt nhận đơn lẻ từ 1 cái/mẫu được cập nhật trên các nền tảng mạng xã hội, hãy theo dõi để nhận thông tin mới nhất nhé!' },
      { question: 'Thời gian hoàn thiện đơn hàng mất bao lâu?', answer: 'Thời gian sản xuất trung bình từ 2 đến 6 tuần sau khi chốt thiết kế. Đơn hàng số lượng lớn có thể cần thêm thời gian để hoàn thiện tốt nhất.' },
      { question: 'Chúng tôi có ship hàng quốc tế không?', answer: 'Có, chúng tôi hỗ trợ đóng gói và vận chuyển toàn cầu (Worldwide Shipping).' }
    ],
    contactTitle: 'Thông Tin Liên Hệ'
  },
  en: {
    heroTitle: 'About Dioxyzine Frog',
    heroSub: 'Production workshop and design studio specializing in fan merch, merchandise custom, and exclusive handmade fabric gifts. Bringing the best prices to artists and brands.',
    socialHead: 'Follow us now on:',
    storyTitle: 'Our Creative Story',
    storyP1: 'Founded by an independent artist, Dioxyzine Frog was born from a passion for 2D characters and the desire to bring them to life. We deeply understand the difficulties creators face finding a reliable tailor who understands your vision without requiring thousands of pieces.',
    storyP2: 'Our mission is: Democratize high-end custom plushie making, bringing production closer to all creators and businesses. Whether you want a few for unique gifts or mass production for commercialization, we will try our best to make it come true.',
    philosophyTitle: 'Our Philosophy',
    philosophySub: 'Creating with genuine intention, crafting with meticulous handiwork',
    philosophies: [
      { title: 'Crafted with Love', desc: 'Every single item is beautifully stuffed to be incredibly soft and huggable.' },
      { title: 'Creative Freedom', desc: 'No robotic templates. We fully respect your character design ratios.' },
      { title: 'Creator-First', desc: 'Optimized bulk price matrix to fully support independent artists and brands.' },
      { title: 'Quality Guaranteed', desc: 'We select premium 2-way Velboa and 1mm short crystal velvet fabric.' }
    ],
    processTitle: 'Our Production Process',
    processSub: 'A structured, transparent, and collaborative workflow',
    processes: [
      { step: '01', title: 'Consultation', desc: 'We receive your 2D blueprints and listen to your dimensional properties.' },
      { step: '02', title: 'Quotation', desc: 'Transparent cost layouts. A deposit of 50% is required to initiate the patterning.' },
      { step: '03', title: 'Production Preview', desc: 'We print/embroider and send continuous photo adjustments for shape approval.' },
      { step: '04', title: 'Mass Production', desc: 'Our skilled artisans handcraft and sew the entire order.' },
      { step: '05', title: 'Quality Control', desc: 'Every single product is inspected for loose threads and expressions alignment before packing.' },
      { step: '06', title: 'Global Delivery', desc: 'Carefully packed, tracking codes applied, shipped domestically and globally.' }
    ],
    faqTitle: 'Frequently Asked Questions',
    faqSub: 'Everything you need to know about working with our workshop',
    faqs: [
      { question: 'What is your minimum order quantity (MOQ)?', answer: 'We support production from 10 pieces/model for listed products, and 30 pieces/model for completely custom layouts. We occasionally open slots for 1 piece/model orders on our social media, stay tuned!' },
      { question: 'How long does production take?', answer: 'Average production time is 2 to 6 weeks after design finalization. Large volume orders may require more time.' },
      { question: 'Do we ship internationally?', answer: 'Yes, we provide Worldwide Shipping to all destination countries.' }
    ],
    contactTitle: 'Contact Details'
  }
};

export function AboutContactPage() {
  const { lang } = useLanguage();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const t = translations[lang];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      {/* Hero Banner */}
      <section className="relative py-24 bg-gradient-to-br from-[#2C2144] via-[#08080C] to-[#171226] border-b border-[var(--border)] text-center">
        <div className="max-w-4xl mx-auto px-4 z-10">
          <h1 className="font-heading text-5xl md:text-6xl mb-6 text-white">{t.heroTitle}</h1>
          <p className="text-xl text-[var(--silver-gray)] leading-relaxed max-w-2xl mx-auto">{t.heroSub}</p>
        </div>
      </section>

      {/* ĐƯA NÚT SOCIAL MEDIA LÊN ĐẦU TIÊN CỦA THÂN TRANG THEO YÊU CẦU */}
      <section className="py-12 bg-[#09090B] border-b border-[var(--border)] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-6 font-heading tracking-wide">{t.socialHead}</h2>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="https://facebook.com/dioxyzinefrog" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-8 py-4 rounded-full bg-[#1877F2] text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg">
              <Facebook className="w-6 h-6" /> Facebook
            </a>
            <a href="https://instagram.com/dioxyzinefrog.print" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg">
              <Instagram className="w-6 h-6" /> Instagram
            </a>
          </div>
        </div>
      </section>

      {/* CÂU CHUYỆN */}
      <section className="py-24 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-heading text-4xl mb-6 text-white">{t.storyTitle}</h2>
            <div className="space-y-4 text-[var(--muted-foreground)] leading-relaxed text-lg">
              <p>{t.storyP1}</p>
              <p>{t.storyP2}</p>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden border border-[var(--border)]">
            <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&h=600&fit=crop" alt="" className="w-full h-auto opacity-80" />
          </div>
        </div>
      </section>

      {/* CÁC BƯỚC QUY TRÌNH */}
      <section className="py-24 bg-transparent border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl mb-4 text-white">{t.processTitle}</h2>
            <p className="text-lg text-[var(--muted-foreground)]">{t.processSub}</p>
          </div>
          <div className="space-y-6">
            {t.processes.map((item, index) => (
              <div key={index} className="flex gap-6 items-start bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-md">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] font-bold text-xl">{item.step}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[#09090B] border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl mb-4 text-white">{t.faqTitle}</h2>
            <p className="text-lg text-[var(--muted-foreground)]">{t.faqSub}</p>
          </div>
          <div className="space-y-4">
            {t.faqs.map((faq, index) => (
              <div key={index} className="bg-[#130D1E] border border-[var(--border)] rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)} className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-[var(--primary)]/10 cursor-pointer">
                  <h3 className="font-semibold text-lg pr-4 text-white">{faq.question}</h3>
                  <span className="text-[var(--primary)] text-2xl font-bold">{openFaqIndex === index ? '−' : '+'}</span>
                </button>
                {openFaqIndex === index && (
                  <p className="px-6 pb-5 text-[var(--muted-foreground)] leading-relaxed border-t border-[var(--border)]/30 pt-4 font-medium">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT INFO */}
      <section className="py-24 bg-transparent text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="font-heading text-4xl mb-12 text-white">{t.contactTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8">
              <Mail className="w-10 h-10 text-[var(--primary)] mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-white">Email</h3>
              <a href="mailto:dioxyzine.frog@gmail.com" className="text-[var(--primary)] font-medium">dioxyzine.frog@gmail.com</a>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8">
              <MapPin className="w-10 h-10 text-[var(--primary)] mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-white">{lang === 'vi' ? 'Vị Trí Xưởng' : 'Location'}</h3>
              <p className="font-medium text-[var(--muted-foreground)]">Hanoi, Vietnam</p>
            </div>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8">
              <Clock className="w-10 h-10 text-[var(--primary)] mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-white">{lang === 'vi' ? 'Giờ Làm Việc' : 'Business Hours'}</h3>
              <p className="font-medium text-[var(--muted-foreground)]">Mon - Fri: 9AM - 6PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}