import { motion } from 'motion/react';
import { Heart, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';

interface ProductCardProps {
  id: string;
  title: string;
  image: string;
  basePrice: number;
  moq: number;
  category: string;
  isNew?: boolean;
  isPopular?: boolean;
}

export function ProductCard({
  id,
  title,
  image,
  basePrice,
  moq,
  category,
  isNew = false,
  isPopular = false,
}: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [image, image, image];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Link to={`/product/${id}`}>
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {isNew && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--pastel-mint)] to-[var(--pastel-blue)] text-xs font-medium shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                New
              </span>
            )}
            {isPopular && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--dusty-pink)] to-[var(--burgundy)] text-white text-xs font-medium shadow-md flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Popular
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorited(!isFavorited);
            }}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorited ? 'fill-[var(--dusty-pink)] text-[var(--dusty-pink)]' : 'text-gray-400'
              }`}
            />
          </button>

          {/* Image */}
          <div
            className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[var(--cream)] to-[var(--dusty-pink)]/20"
            onMouseEnter={() => setCurrentImageIndex(1)}
            onMouseLeave={() => setCurrentImageIndex(0)}
          >
            <img
              src={images[currentImageIndex]}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 right-4">
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  className="w-full px-4 py-2.5 rounded-full bg-white text-[var(--burgundy)] font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Configure Product
                </motion.button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-3">
            {/* Category */}
            <span className="inline-block px-3 py-1 rounded-full bg-[var(--cream)] text-xs font-medium text-muted-foreground">
              {category}
            </span>

            {/* Title */}
            <h3 className="font-semibold text-lg leading-tight group-hover:text-[var(--burgundy)] transition-colors">
              {title}
            </h3>

            {/* Pricing Info */}
            <div className="flex items-baseline justify-between pt-2">
              <div>
                <span className="text-xs text-muted-foreground">Starting from</span>
                <p className="text-2xl font-bold bg-gradient-to-r from-[var(--burgundy)] to-[var(--dusty-pink)] bg-clip-text text-transparent">
                  ${basePrice}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">MOQ</span>
                <p className="text-sm font-semibold text-foreground">{moq} pcs</p>
              </div>
            </div>

            {/* Customizable Badge */}
            <div className="pt-2 flex items-center gap-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              <span className="text-xs text-[var(--burgundy)] font-medium">✨ Customizable</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
