import { useState } from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router';
import {
  Upload,
  CheckCircle,
  User,
  Mail,
  MessageSquare,
  Package,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';

export function QuoteRequestPage() {
  const location = useLocation();
  const prefillData = location.state;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    productType: prefillData?.product?.title || '',
    quantity: prefillData?.configuration?.quantity || '',
    budgetRange: '',
    deadline: '',
    description: '',
  });

  const steps = [
    { number: 1, title: 'Contact Info', icon: <User className="w-5 h-5" /> },
    { number: 2, title: 'Project Details', icon: <Package className="w-5 h-5" /> },
    { number: 3, title: 'Requirements', icon: <MessageSquare className="w-5 h-5" /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white to-[var(--cream)] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="max-w-2xl w-full bg-white rounded-3xl p-12 shadow-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--dusty-pink)] to-[var(--burgundy)] flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] bg-clip-text text-transparent">
            Quote Request Received!
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Thank you for your interest! Our team will review your request and get back to you
            with a detailed quote within 24 hours.
          </p>

          <div className="bg-[var(--cream)] rounded-2xl p-6 mb-8">
            <h3 className="font-semibold mb-4">What happens next?</h3>
            <div className="space-y-3 text-left">
              {[
                'Our team reviews your project requirements',
                'We prepare a detailed quote and timeline',
                'You receive an email with pricing and next steps',
                'We schedule a call to discuss your vision',
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--dusty-pink)] to-[var(--burgundy)] text-white flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="text-muted-foreground">{step}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <a href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] text-white font-semibold shadow-lg"
            >
              Back to Home
            </motion.button>
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-white to-[var(--cream)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] bg-clip-text text-transparent">
            Request a Quote
          </h1>
          <p className="text-lg text-muted-foreground">
            Share your project details and we'll create a custom quote for you
          </p>
        </motion.div>

        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: currentStep >= step.number ? 1 : 0.8,
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-br from-[var(--burgundy)] to-[var(--dusty-pink)] text-white shadow-lg'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step.icon}
                  </motion.div>
                  <span
                    className={`text-sm font-medium ${
                      currentStep >= step.number ? 'text-[var(--burgundy)]' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 relative top-[-20px]">
                    <div className="h-full bg-gray-200"></div>
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: currentStep > step.number ? '100%' : '0%' }}
                      className="h-full bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] absolute top-0 left-0"
                    ></motion.div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-8 shadow-xl"
        >
          {/* Step 1: Contact Info */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-[var(--burgundy)]" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--cream)] border border-border focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[var(--burgundy)]" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--cream)] border border-border focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--burgundy)]" />
                  Social Media / Contact Link
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--cream)] border border-border focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] transition-all"
                  placeholder="Instagram, Twitter, or other contact"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2: Project Details */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  <Package className="w-4 h-4 text-[var(--burgundy)]" />
                  Product Type *
                </label>
                <select
                  name="productType"
                  required
                  value={formData.productType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--cream)] border border-border focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] transition-all"
                >
                  <option value="">Select product type</option>
                  <option value="Custom Character Plushie">Custom Character Plushie</option>
                  <option value="Anime Keychain Set">Anime Keychain Set</option>
                  <option value="Enamel Pin Collection">Enamel Pin Collection</option>
                  <option value="Mini Standee Figure">Mini Standee Figure</option>
                  <option value="Other">Other (specify in description)</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--cream)] border border-border focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] transition-all"
                  placeholder="Enter desired quantity"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[var(--burgundy)]" />
                  Budget Range
                </label>
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--cream)] border border-border focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] transition-all"
                >
                  <option value="">Select budget range</option>
                  <option value="under-500">Under $500</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-2500">$1,000 - $2,500</option>
                  <option value="2500-5000">$2,500 - $5,000</option>
                  <option value="5000-plus">$5,000+</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--burgundy)]" />
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--cream)] border border-border focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] transition-all"
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Requirements */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[var(--burgundy)]" />
                  Project Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--cream)] border border-border focus:outline-none focus:ring-2 focus:ring-[var(--dusty-pink)] transition-all resize-none"
                  placeholder="Describe your project in detail: character design, colors, special features, intended use, etc."
                />
              </div>

              <div>
                <label className="block mb-2 font-medium flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[var(--burgundy)]" />
                  Upload Reference Images
                </label>
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-[var(--cream)] hover:border-[var(--dusty-pink)] transition-colors cursor-pointer">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium mb-1">Drop files here or click to upload</p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, PDF up to 10MB each
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            {currentStep > 1 && (
              <motion.button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-full border-2 border-[var(--burgundy)] text-[var(--burgundy)] font-semibold hover:bg-[var(--burgundy)] hover:text-white transition-colors"
              >
                Previous
              </motion.button>
            )}

            {currentStep < 3 ? (
              <motion.button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-auto px-6 py-3 rounded-full bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] text-white font-semibold shadow-lg"
              >
                Next Step
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="ml-auto px-8 py-3 rounded-full bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] text-white font-semibold shadow-lg"
              >
                Submit Quote Request
              </motion.button>
            )}
          </div>
        </motion.form>
      </div>
    </div>
  );
}
