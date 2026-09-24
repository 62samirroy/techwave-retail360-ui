'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  MessageCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Check,
  ArrowLeft,
  Loader2,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { ProductData, ReviewData } from '@/types';
import { formatPrice, buildWhatsAppLink, formatDate } from '@/lib/utils';
import { APP_CONFIG } from '@/lib/constants';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await api.getProductById(id);
        if (res.success && res.data) {
          setProduct(res.data);
          const firstImg = res.data.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800';
          setSelectedImage(firstImg);
          if (res.data.reviews) {
            setReviews(res.data.reviews);
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-xs text-brand-500 font-medium">Loading saree details & weaving notes...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-3 p-4">
        <h2 className="text-base font-bold text-brand-900">Saree not found</h2>
        <p className="text-xs text-brand-500">The product you are looking for may have been archived or is out of catalog.</p>
        <Link href="/shop">
          <Button variant="primary" size="sm">
            Back to Shop
          </Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 4;

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    try {
      const res = await api.addToCart(product.id, quantity);
      if (res.success) {
        window.dispatchEvent(new Event('cart-updated'));
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      } else {
        alert(res.message);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await api.addToCart(product.id, quantity);
    window.dispatchEvent(new Event('cart-updated'));
    router.push('/checkout');
  };

  const handleWishlist = async () => {
    setIsWishlisted(!isWishlisted);
    try {
      await api.toggleWishlist(product.id);
    } catch (e) {
      setIsWishlisted(isWishlisted);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await api.submitReview({
        productId: product.id,
        rating: newRating,
        userName: reviewerName.trim() || undefined,
        comment: reviewComment.trim(),
      });

      if (res.success && res.data) {
        setReviews([res.data, ...reviews]);
        setReviewComment('');
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  const whatsappInquiryUrl = buildWhatsAppLink(
    `Namaste Royal Saree, I would like to inquire about: ${product.name} (SKU: ${product.sku}, Price: ${formatPrice(product.discountPrice || product.price)}). Can you send fabric drape video?`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-brand-500">
        <Link href="/shop" className="hover:text-primary-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Sarees</span>
        </Link>
        <span>/</span>
        <span className="truncate max-w-[200px] font-semibold text-brand-900">{product.name}</span>
      </div>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-3">
          {/* Large Main Preview */}
          <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border border-brand-200 bg-brand-100 shadow-sm">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top"
            />
            {product.isBestseller && (
              <div className="absolute top-3 left-3">
                <Badge variant="royal" size="sm">Bestseller</Badge>
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative h-16 w-16 rounded border overflow-hidden shrink-0 transition-all ${
                    selectedImage === img.url
                      ? 'border-primary-600 ring-2 ring-primary-500/20'
                      : 'border-brand-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    className="object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Meta, Price, Actions, Attributes */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs text-brand-500 mb-1">
              <span className="font-semibold text-primary-700 tracking-wide uppercase text-[11px]">
                {product.category?.name || 'Handloom Silk'}
              </span>
              <span className="font-mono text-brand-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-lg sm:text-2xl font-serif font-bold text-brand-950 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Reviews summary */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-royal-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(product.rating || 5) ? 'fill-royal-500 text-royal-500' : 'text-brand-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-brand-800">
                {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
              </span>
              <span className="text-xs text-brand-400">({reviews.length} customer reviews)</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="rounded-lg bg-brand-50 p-3 border border-brand-200/80">
            <PriceDisplay
              price={product.price}
              discountPrice={product.discountPrice}
              size="lg"
            />
            <p className="text-[11px] text-brand-500 mt-1">
              Inclusive of all taxes (GST 5%). Free express courier delivery on this saree.
            </p>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-xs text-brand-700 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Stock Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-brand-600">Availability:</span>
            {isOutOfStock ? (
              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Out of Stock (Under Weave)
              </span>
            ) : isLowStock ? (
              <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Only {product.stock} units remaining in warehouse
              </span>
            ) : (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" /> In Stock — Ships within 24 hours
              </span>
            )}
          </div>

          {/* Quantity Selector & Order Buttons */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-brand-700">Quantity:</span>
              <div className="flex items-center rounded-md border border-brand-300 bg-white">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-xs font-bold text-brand-600 hover:bg-brand-50 disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-semibold text-brand-900 border-x border-brand-200">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock || isOutOfStock}
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-2.5 py-1 text-xs font-bold text-brand-600 hover:bg-brand-50 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Button
                variant="primary"
                size="md"
                disabled={isOutOfStock || isAdding}
                onClick={handleAddToCart}
                isLoading={isAdding}
                className={justAdded ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 mr-1.5" /> Add to Cart
                  </>
                )}
              </Button>

              <Button
                variant="gold"
                size="md"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>

            {/* Secondary Action Buttons: WhatsApp Inquiry & Wishlist */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Video & Query</span>
                </Button>
              </a>

              <Button
                variant="outline"
                size="sm"
                onClick={handleWishlist}
                className={isWishlisted ? 'text-rose-600 border-rose-200' : ''}
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Value Props & Shipping Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-brand-200 text-[11px] text-brand-600">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span>Free Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>7-Day Return</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-royal-600 shrink-0" />
              <span>100% Authentic</span>
            </div>
          </div>

          {/* Product Attributes Table (Flexible for any industry) */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="pt-4 border-t border-brand-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-900 mb-2">
                Weave & Fabric Specifications
              </h3>
              <div className="rounded border border-brand-200 divide-y divide-brand-100 text-xs overflow-hidden">
                {product.attributes.map((attr, idx) => (
                  <div key={idx} className="flex py-1.5 px-3 bg-white even:bg-brand-50/40">
                    <span className="w-36 font-semibold text-brand-700 shrink-0">
                      {attr.name}
                    </span>
                    <span className="text-brand-900">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Description & Weaving Background */}
      <div className="rounded-lg border border-brand-200 bg-white p-6 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-900 border-b border-brand-100 pb-2">
          Artisan Story & Drape Description
        </h2>
        <p className="text-xs text-brand-700 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </div>

      {/* Customer Reviews Section */}
      <div className="rounded-lg border border-brand-200 bg-white p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-brand-100 pb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-900">
              Verified Customer Reviews
            </h2>
            <p className="text-xs text-brand-500">
              Average Rating: <strong className="text-royal-600">{product.rating ? Number(product.rating).toFixed(1) : '5.0'} / 5.0</strong> based on {reviews.length} authentic purchases
            </p>
          </div>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-3">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev.id} className="p-3 rounded-md bg-brand-50/60 border border-brand-200/70 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-brand-900">{rev.userName}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-brand-400">{formatDate(rev.createdAt)}</span>
                </div>
                <div className="flex text-royal-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < rev.rating ? 'fill-royal-500 text-royal-500' : 'text-brand-300'}`}
                    />
                  ))}
                </div>
                <p className="text-brand-700 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-brand-400 italic">No reviews yet for this saree. Be the first to share your drape feedback!</p>
          )}
        </div>

        {/* Write a Review Form */}
        <div className="pt-4 border-t border-brand-200">
          <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wide mb-3">
            Write a Review
          </h3>
          <form onSubmit={handleReviewSubmit} className="space-y-3 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-brand-700">Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-0.5 text-royal-500 focus:outline-none"
                  >
                    <Star className={`w-4 h-4 ${star <= newRating ? 'fill-royal-500' : 'text-brand-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1">Your Name</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Shalini Roy"
                className="w-full rounded-md border border-brand-300 px-3 py-1.5 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-brand-700 mb-1">Your Review</label>
              <textarea
                required
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience about the zari shine, fabric softness, and delivery..."
                className="w-full rounded-md border border-brand-300 px-3 py-1.5 text-xs text-brand-900 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <Button type="submit" size="xs" variant="primary" isLoading={submittingReview}>
              Submit Review
            </Button>

            {reviewSuccess && (
              <p className="text-xs text-emerald-700 font-medium">Thank you! Your review has been added.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
