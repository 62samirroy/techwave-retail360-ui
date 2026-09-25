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
import { ProductAiAsk } from '@/components/shop/ProductAiAsk';
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
  const [reviewError, setReviewError] = useState('');
  const [eligibility, setEligibility] = useState<{
    isLoggedIn: boolean;
    hasPurchased: boolean;
    canReview: boolean;
    existingReview?: any;
    message?: string;
  } | null>(null);

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

          // Check if current user has purchased this product
          try {
            const eligRes = await api.checkReviewEligibility(res.data.id);
            if (eligRes.success && eligRes.data) {
              setEligibility(eligRes.data);
              if (eligRes.data.existingReview) {
                setNewRating(eligRes.data.existingReview.rating);
                setReviewComment(eligRes.data.existingReview.comment);
                setReviewerName(eligRes.data.existingReview.userName || '');
              }
            }
          } catch (e) {}
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
    setReviewError('');
    try {
      const res = await api.submitReview({
        productId: product.id,
        rating: newRating,
        userName: reviewerName.trim() || undefined,
        comment: reviewComment.trim(),
      });

      if (res.success && res.data) {
        setReviews((prev) => {
          const filtered = prev.filter((r) => r.id !== res.data.id && r.userId !== res.data.userId);
          return [res.data, ...filtered];
        });
        setReviewSuccess(true);
        setTimeout(() => setReviewSuccess(false), 4000);
      } else {
        setReviewError(res.message || 'Failed to submit review.');
      }
    } catch (e: any) {
      setReviewError(e.message || 'Error submitting review.');
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Large Main Preview */}
          <div className="group relative aspect-[3/4.2] w-full rounded-3xl overflow-hidden border border-[#ECE7DF] bg-[#FAF8F5] shadow-[0_16px_40px_rgba(33,27,38,0.06)]">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Bestseller Badge */}
            {product.isBestseller && (
              <div className="absolute top-3.5 left-3.5 z-10">
                <span className="rounded-full bg-[#211B26] text-amber-200 border border-amber-300/40 px-3 py-1 text-xs font-semibold tracking-wider uppercase shadow-xs">
                  ★ Bestseller
                </span>
              </div>
            )}

            {/* Silk Mark Certified Badge */}
            <div className="absolute bottom-3.5 left-3.5 z-10 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1 text-[11px] font-semibold text-stone-800 shadow-sm border border-stone-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Pure Silk Verified</span>
            </div>
          </div>

          {/* Thumbnails Row */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative h-20 w-20 rounded-2xl border overflow-hidden shrink-0 transition-all ${
                    selectedImage === img.url
                      ? 'border-[#211B26] ring-2 ring-[#211B26]/20 shadow-xs scale-102'
                      : 'border-stone-200 opacity-75 hover:opacity-100'
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

          {/* Heritage Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-stone-600">
            <div className="rounded-xl border border-stone-200/80 bg-white p-2.5 text-center shadow-2xs">
              <span className="block font-semibold text-[#211B26]">Handloom Woven</span>
              <span className="text-[10px] text-stone-400">Master Artisan Legacy</span>
            </div>
            <div className="rounded-xl border border-stone-200/80 bg-white p-2.5 text-center shadow-2xs">
              <span className="block font-semibold text-[#211B26]">Real Zari Hallmark</span>
              <span className="text-[10px] text-stone-400">Tested Quality</span>
            </div>
            <div className="rounded-xl border border-stone-200/80 bg-white p-2.5 text-center shadow-2xs">
              <span className="block font-semibold text-[#211B26]">Insured Transit</span>
              <span className="text-[10px] text-stone-400">Royal Box Packaging</span>
            </div>
          </div>
        </div>

        {/* Right Column: Product Meta, Price, Actions, AI Assistant, Attributes */}
        <div className="lg:col-span-6 space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
              <span className="font-semibold text-[#9333EA] tracking-widest uppercase text-[11px]">
                {product.category?.name || 'Handloom Silk'}
              </span>
              <span className="font-mono text-stone-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-serif font-bold text-[#211B26] leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Reviews summary */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-800">
                {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
              </span>
              <span className="text-xs text-stone-400">({reviews.length} reviews)</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="rounded-2xl bg-[#FAF8F5] p-4 border border-[#ECE7DF]">
            <PriceDisplay
              price={product.price}
              discountPrice={product.discountPrice}
              size="lg"
            />
            <p className="text-[11px] text-stone-500 mt-1.5">
              Inclusive of all taxes (GST 5%). Free express courier delivery on this saree.
            </p>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Stock Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-stone-600">Availability:</span>
            {isOutOfStock ? (
              <span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Out of Stock (Under Weave)
              </span>
            ) : isLowStock ? (
              <span className="text-amber-800 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Only {product.stock} units remaining in warehouse
              </span>
            ) : (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> In Stock — Ships within 24 hours
              </span>
            )}
          </div>

          {/* Quantity Selector & Order Buttons */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-stone-700">Quantity:</span>
              <div className="flex items-center rounded-xl border border-stone-300 bg-white shadow-2xs overflow-hidden">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-3.5 py-1.5 text-xs font-semibold text-[#211B26] border-x border-stone-200">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock || isOutOfStock}
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                disabled={isOutOfStock || isAdding}
                onClick={handleAddToCart}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-xs sm:text-sm font-medium tracking-wide transition-all shadow-sm ${
                  justAdded
                    ? 'bg-emerald-600 text-white'
                    : isOutOfStock
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-[#211B26] hover:bg-[#342b3d] text-white active:scale-98'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5 stroke-[2.5]" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 mr-1.5" /> Add to Cart
                  </>
                )}
              </button>

              <button
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-xs sm:text-sm font-medium tracking-wide bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-sm active:scale-98 transition-all disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>

            {/* Secondary Action Buttons: WhatsApp Inquiry & Wishlist */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 px-4 py-2.5 text-xs font-medium transition-colors shadow-2xs">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Video &amp; Drape Query</span>
                </button>
              </a>

              <button
                onClick={handleWishlist}
                className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-2xs transition-colors ${
                  isWishlisted
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-500'
                }`}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Value Props & Shipping Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-200/80 text-[11px] text-stone-600">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#9333EA] shrink-0" />
              <span>Free Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>7-Day Return</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>100% Authentic</span>
            </div>
          </div>

          {/* AI STYLIST WIDGET - Ask AI About This Particular Saree */}
          <div className="pt-2">
            <ProductAiAsk product={product} />
          </div>

          {/* Product Attributes Table (Flexible for any industry) */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="pt-4 border-t border-stone-200/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#211B26] mb-2.5">
                Weave &amp; Fabric Specifications
              </h3>
              <div className="rounded-2xl border border-stone-200 divide-y divide-stone-100 text-xs overflow-hidden shadow-2xs">
                {product.attributes.map((attr, idx) => (
                  <div key={idx} className="flex py-2 px-3.5 bg-white even:bg-stone-50/50">
                    <span className="w-36 font-semibold text-stone-700 shrink-0">
                      {attr.name}
                    </span>
                    <span className="text-stone-900">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Description & Weaving Background */}
      <div className="rounded-2xl border border-[#ECE7DF] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-serif font-bold text-[#211B26] border-b border-[#F0EBE3] pb-3">
          Artisan Story &amp; Drape Description
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </div>

      {/* Customer Reviews Section */}
      <div className="rounded-2xl border border-[#ECE7DF] bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#F0EBE3] pb-4">
          <div>
            <h2 className="text-base font-serif font-bold text-[#211B26]">
              Verified Customer Reviews
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Average Rating: <strong className="text-[#211B26] font-bold">{product.rating ? Number(product.rating).toFixed(1) : '5.0'} / 5.0</strong> based on {reviews.length} authentic purchases
            </p>
          </div>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-3">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE7DF] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#211B26]">{rev.userName}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-bold px-2 py-0.5 border border-emerald-200">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400">{formatDate(rev.createdAt)}</span>
                </div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                    />
                  ))}
                </div>
                <p className="text-stone-700 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-stone-400 italic">No reviews yet for this saree. Be the first to share your drape feedback!</p>
          )}
        </div>

        {/* Write a Review Form */}
        <div className="pt-5 border-t border-[#F0EBE3]">
          <h3 className="text-xs font-bold text-[#211B26] uppercase tracking-wider mb-3">
            {eligibility?.existingReview ? 'Update Your Review' : 'Write a Verified Review'}
          </h3>

          {!eligibility?.isLoggedIn ? (
            <div className="rounded-xl border border-stone-200 bg-[#FAF8F5] p-4 text-xs text-stone-600 space-y-2">
              <p>Only verified customers who have purchased this saree can submit a rating and review.</p>
              <Link href={`/login?redirect=/product/${id}`}>
                <Button variant="secondary" size="xs" className="mt-1">
                  Sign In to Review
                </Button>
              </Link>
            </div>
          ) : !eligibility.hasPurchased ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs text-stone-500">
              <p>
                🔒 <strong>Verified Purchase Required:</strong> You have not completed an order containing this saree under this account yet. Only verified purchasers may leave public reviews.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3 max-w-lg">
              {reviewError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                  {reviewError}
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-700">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-0.5 text-amber-500 focus:outline-hidden"
                    >
                      <Star className={`w-4 h-4 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Shalini Roy"
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs text-[#211B26] focus:border-[#211B26] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Your Review</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience about the zari shine, fabric softness, drape weight, and delivery..."
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2 text-xs text-[#211B26] focus:border-[#211B26] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="inline-flex items-center justify-center rounded-full bg-[#211B26] hover:bg-[#342b3d] text-white px-5 py-2 text-xs font-medium transition-all shadow-xs disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : eligibility?.existingReview ? 'Update Review' : 'Submit Verified Review'}
              </button>

              {reviewSuccess && (
                <p className="text-xs text-emerald-700 font-medium">Thank you! Your verified review has been recorded.</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
