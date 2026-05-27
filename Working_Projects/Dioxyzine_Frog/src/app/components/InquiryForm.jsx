import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, CheckCircle, Loader2, X } from 'lucide-react';

export function InquiryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    country: '',
    email: '',
    phone: '',
    hasDesign: '',
    quantity: '',
    budget: '',
    size: '',
    socialMedia: '',
    referral: '',
    notes: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-12 shadow-xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--dusty-pink)] to-[var(--burgundy)] flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-3xl font-bold mb-4">Inquiry Received!</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Thank you for your inquiry. Our team will review your request and respond within 24
          hours with detailed information and pricing.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              firstName: '',
              country: '',
              email: '',
              phone: '',
              hasDesign: '',
              quantity: '',
              budget: '',
              size: '',
              socialMedia: '',
              referral: '',
              notes: '',
            });
            setUploadedFiles([]);
          }}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] text-white font-medium hover:shadow-lg transition-shadow"
        >
          Submit Another Inquiry
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
      <div className="mb-8">
        <h3 className="text-3xl font-bold mb-2">Start Your Project</h3>
        <p className="text-muted-foreground">
          Fill out the form below and we'll get back to you with a detailed quote
        </p>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="relative">
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder=" "
            className="peer w-full px-4 py-3.5 rounded-2xl border border-border bg-[var(--cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] focus:border-transparent transition-all"
          />
          <label className="absolute left-4 top-3.5 text-muted-foreground transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[var(--burgundy)] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2">
            First Name *
          </label>
        </div>

        <div className="relative">
          <input
            type="text"
            name="country"
            required
            value={formData.country}
            onChange={handleInputChange}
            placeholder=" "
            className="peer w-full px-4 py-3.5 rounded-2xl border border-border bg-[var(--cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] focus:border-transparent transition-all"
          />
          <label className="absolute left-4 top-3.5 text-muted-foreground transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[var(--burgundy)] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2">
            Country *
          </label>
        </div>

        <div className="relative">
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder=" "
            className="peer w-full px-4 py-3.5 rounded-2xl border border-border bg-[var(--cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] focus:border-transparent transition-all"
          />
          <label className="absolute left-4 top-3.5 text-muted-foreground transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[var(--burgundy)] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2">
            Email Address *
          </label>
        </div>

        <div className="relative">
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder=" "
            className="peer w-full px-4 py-3.5 rounded-2xl border border-border bg-[var(--cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] focus:border-transparent transition-all"
          />
          <label className="absolute left-4 top-3.5 text-muted-foreground transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[var(--burgundy)] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2">
            Phone Number
          </label>
        </div>
      </div>

      {/* Design Status */}
      <div className="mb-6">
        <label className="block mb-3 font-medium text-foreground">
          Do you already have a design? *
        </label>
        <div className="flex gap-4">
          {['Yes', 'No'].map((option) => (
            <label
              key={option}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                formData.hasDesign === option
                  ? 'border-[var(--burgundy)] bg-[var(--dusty-pink)]/10'
                  : 'border-border hover:border-[var(--dusty-pink)]'
              }`}
            >
              <input
                type="radio"
                name="hasDesign"
                value={option}
                checked={formData.hasDesign === option}
                onChange={handleInputChange}
                className="w-4 h-4 text-[var(--burgundy)] focus:ring-[var(--dusty-pink)]"
                required
              />
              <span className="font-medium">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="relative">
          <select
            name="quantity"
            required
            value={formData.quantity}
            onChange={handleInputChange}
            className="w-full px-4 py-3.5 rounded-2xl border border-border bg-[var(--cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] focus:border-transparent transition-all appearance-none cursor-pointer"
          >
            <option value="">Select Quantity *</option>
            <option value="1">1 pc</option>
            <option value="2-50">2–50 pcs</option>
            <option value="51-100">51–100 pcs</option>
            <option value="100+">100+ pcs</option>
          </select>
        </div>

        <div className="relative">
          <input
            type="text"
            name="budget"
            value={formData.budget}
            onChange={handleInputChange}
            placeholder=" "
            className="peer w-full px-4 py-3.5 rounded-2xl border border-border bg-[var(--cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] focus:border-transparent transition-all"
          />
          <label className="absolute left-4 top-3.5 text-muted-foreground transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[var(--burgundy)] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2">
            Project Budget
          </label>
        </div>

        <div className="relative">
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleInputChange}
            placeholder=" "
            className="peer w-full px-4 py-3.5 rounded-2xl border border-border bg-[var(--cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] focus:border-transparent transition-all"
          />
          <label className="absolute left-4 top-3.5 text-muted-foreground transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[var(--burgundy)] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2">
            Desired Product Size
          </label>
        </div>

        <div className="relative">
          <input
            type="text"
            name="socialMedia"
            value={formData.socialMedia}
            onChange={handleInputChange}
            placeholder=" "
            className="peer w-full px-4 py-3.5 rounded-2xl border border-border bg-[var(--cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] focus:border-transparent transition-all"
          />
          <label className="absolute left-4 top-3.5 text-muted-foreground transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[var(--burgundy)] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2">
            Social Media Account
          </label>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            name="referral"
            value={formData.referral}
            onChange={handleInputChange}
            placeholder=" "
            className="peer w-full px-4 py-3.5 rounded-2xl border border-border bg-[var(--cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] focus:border-transparent transition-all"
          />
          <label className="absolute left-4 top-3.5 text-muted-foreground transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[var(--burgundy)] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2">
            How did you hear about us?
          </label>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block mb-3 font-medium text-foreground">Upload Design Files</label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[var(--burgundy)] bg-[var(--dusty-pink)]/10'
              : 'border-border hover:border-[var(--dusty-pink)] bg-[var(--cream)]/50'
          }`}
        >
          <input
            type="file"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">Drop files here or click to upload</p>
          <p className="text-sm text-muted-foreground">PNG, JPG, PDF, AI up to 10MB each</p>
        </div>

        {/* Uploaded Files */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--cream)]/50 border border-border"
                >
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <div className="relative">
          <textarea
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleInputChange}
            placeholder=" "
            className="peer w-full px-4 py-3.5 rounded-2xl border border-border bg-[var(--cream)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] focus:border-transparent transition-all resize-none"
          />
          <label className="absolute left-4 top-3.5 text-muted-foreground transition-all peer-focus:text-xs peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[var(--burgundy)] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2">
            Additional Requests / Notes
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        className="w-full py-4 rounded-full bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] text-white font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Inquiry'
        )}
      </motion.button>
    </form>
  );
}
