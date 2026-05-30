import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const termsData = {
  vi: [
    {
      id: 'ky-thuat',
      title: '1. Lưu ý về kỹ thuật',
      content: `- Màu in ra sẽ có sự chênh lệch từ 5-10% so với file in, màu tông lạnh và tối sẽ dễ lệch hơn tông nóng.
- Hệ màu chúng tôi nhận in là CMYK, nếu bạn sử dụng file hệ RGB xin hãy lưu ý về khả năng lệch màu. Nếu sử dụng các phần mềm vẽ trên điện thoại như IbisPaintX, bạn sẽ cần đổi hệ màu trước khi in vì hệ màu mặc định của hầu hết các phần mềm là RGB.
- Nếu không đổi hệ màu và kéo chỉnh, lưu ý rằng các màu xanh biển (cobalt blue) sẽ rất dễ ngả tím, ám tím, để tránh tình trạng này hãy chọn màu thiên về xanh cyan (xanh miku).
- Vải sẽ có thể co rút, xê dịch khi in làm hình in bị ảnh hưởng (kéo dãn hoặc co lại, v.v), nếu bị nặng chúng tôi sẽ in bù hoàn toàn miễn phí.
- Một số lỗi vải phổ biến: cấn vải, gấp vải, bụi đốm trắng. Nếu không ảnh hưởng quá 10% hình in hoặc lỗi không nằm ở các chi tiết quan trọng và nổi bật, chúng tôi xin phép không in lại.
- Chúng tôi tiến hành in bù miễn phí đối với các lỗi: in thiếu, in sai, lệch màu nhiều hơn 10%, lỗi vải cấn các vị trí quan trọng và nổi bật.`
    },
    {
      id: 'san-xuat',
      title: '2. Lưu ý về sản xuất',
      content: `- Hàng may xong sẽ co size lại khoảng 1-3cm so với hình in ra, hãy lưu ý để size tranh to hơn so với size muốn làm.
- Sản phẩm 3D sẽ không thể giống y đúc 100% bản vẽ 2D, có những chênh lệch nhất định vì vải còn phồng lên do bông nhồi. Một số form đầu sẽ bị thay đổi ví dụ như tròn thành vuông, nhọn,...
- Xin vui lòng chấp nhận lỗi sản xuất mặc định từ 1-5% sản phẩm, ví dụ: chỉ thừa, đính chi tiết lệch dưới 5mm, lộ đường chỉ nhẹ,...
- Chúng tôi không có dây chuyền sản xuất nhà máy công nghiệp; tất cả sản phẩm đều được hoàn thiện thủ công bằng tay bởi đội ngũ thợ lành nghề. Nếu cần sửa đổi gì, xin hãy thông báo cho chúng tôi ngay trong lúc gửi ảnh sản phẩm.`
    },
    {
      id: 'doi-tra',
      title: '3. Chính sách đổi trả',
      content: `- Hoàn tiền theo % lỗi của sản phẩm nếu các vấn đề nằm ngoài danh mục đã nêu trên.
- Sau khi đã nhận hàng từ 48h, chúng tôi không chấp nhận giải quyết các khiếu nại về sản phẩm.
- Nếu yêu cầu sửa nhiều hơn 50% mẫu ban đầu đã chốt (ví dụ sửa rập, sửa chi tiết đã in ra,...), chúng tôi sẽ tính chi phí như sản xuất mới hoàn toàn.
- Nếu trong suốt quá trình sản xuất và cập nhật ảnh sản phẩm bạn không phản ánh và yêu cầu chỉnh sửa, chúng tôi sẽ không hỗ trợ sửa sau khi đã nhận hàng nữa. Trong quá trình sản xuất, chúng tôi sẽ cố gắng điều chỉnh theo ý muốn của khách hàng cho đến khi bạn ưng ý.`
    }
  ],
  en: [
    {
      id: 'ky-thuat',
      title: '1. Technical Notes',
      content: `- Printed colors may differ by 5-10% from the original file. Cold and dark tones tend to have more color shift than warm tones.
- We only accept CMYK color mode for printing. If you use RGB files, please be aware of potential color discrepancies. If you design using mobile apps like IbisPaint X, you must convert the color mode before sending the file for printing, as most mobile drawing apps default to RGB.
- If you do not convert the color mode and adjust it yourself, note that colors like cobalt blue can easily shift to purple or have a purple tint. To avoid this, choose colors closer to cyan blue (Miku blue).
- Fabric may shrink, shift, or stretch during printing, which can affect the printed design. If the distortion is severe, we will reprint for free.
- Common fabric defects include: creased fabric, folded fabric, and white dust spots. If these defects affect less than 10% of the print or are not on important/noticeable details, we reserve the right not to reprint.
- We will reprint for free in the following cases: missing print, incorrect print, color deviation over 10%, or fabric creases on important/noticeable areas.`
    },
    {
      id: 'san-xuat',
      title: '2. Production Notes',
      content: `- After sewing is completed, the final product may shrink by approximately 1-3cm compared to the printed pattern. Please take this into account and make your design slightly larger than the desired final size.
- 3D products cannot be 100% identical to the 2D design due to the fabric puffing up from the stuffing. Some shapes may change (e.g., round becomes square, pointed becomes blunt, etc.).
- Please accept a standard production defect rate of 1-5%, such as: excess threads, details off by less than 5mm, slight seam exposure, etc.
- We do not have a factory production line; all items are handmade by our team of tailors. If you need any corrections, please inform us immediately when we send you the product photos.`
    },
    {
      id: 'doi-tra',
      title: '3. Return & Refund Policy',
      content: `- We will issue a partial refund based on the percentage of defects if the issues fall outside the categories listed above.
- Complaints about the product will not be accepted after 48 hours from the time of receipt.
- If you request modifications exceeding 50% of the original approved design (e.g., changing the pattern, altering already printed details, etc.), we will charge it as a new production.
- If you do not provide feedback or request edits during the production process when we send update photos, we will not accept any modification requests after you have received the final product. During production, we will do our best to adjust according to your preferences until you are satisfied.`
    }
  ]
};

export function TermsShippingPage() {
  const { lang } = useLanguage();
  const sections = termsData[lang];
  const [activeSection, setActiveSection] = useState('ky-thuat');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress((window.scrollY / scrollHeight) * 100);

      const sectionElements = sections.map((s) => document.getElementById(s.id));
      const currentSection = sectionElements.find((el) => {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 150 && rect.bottom >= 150;
      });
      if (currentSection) setActiveSection(currentSection.id);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-transparent relative z-10">
      <div className="fixed top-0 left-0 right-0 h-1 bg-[var(--cyber-black)] z-50">
        <motion.div style={{ width: `${scrollProgress}%` }} className="h-full bg-[var(--primary)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <h2 className="text-sm font-semibold text-[var(--muted-foreground)] mb-4 uppercase tracking-wide">
                {lang === 'vi' ? 'Mục lục' : 'Index'}
              </h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button key={section.id} onClick={() => scrollToSection(section.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeSection === section.id ? 'bg-[var(--primary)]/20 text-white font-medium border border-[var(--primary)]/50' : 'text-[var(--silver-gray)] hover:text-white hover:bg-[var(--card)]'}`}>
                    <div className="flex items-center gap-2">
                      {activeSection === section.id && <ChevronRight className="w-4 h-4 text-[var(--primary)]" />}
                      <span className={activeSection !== section.id ? 'ml-6' : ''}>{section.title}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
              <h1 className="font-heading text-5xl md:text-6xl mb-6 text-white drop-shadow-[0_0_15px_rgba(139,114,190,0.5)]">
                {lang === 'vi' ? 'Điều Khoản Dịch Vụ - In ấn' : 'Terms of Service - Printing'}
              </h1>
            </motion.div>

            <div className="space-y-16">
              {sections.map((section) => (
                <motion.section key={section.id} id={section.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="scroll-mt-32">
                  <h2 className="font-heading text-3xl text-white mb-4">{section.title}</h2>
                  <div className="ml-4">
                    <p className="text-[var(--silver-gray)] leading-relaxed text-lg whitespace-pre-line font-medium">
                      {section.content}
                    </p>
                  </div>
                </motion.section>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}