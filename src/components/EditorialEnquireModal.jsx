import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function EditorialEnquireModal({ item, onClose }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);

  if (!item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      // auto close after showing confirmation
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white border border-[#E4D9C8] rounded-sm p-8 space-y-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-[#2B3A67]/60 hover:text-[#2B3A67] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!sent ? (
          <>
            <div>
              <span className="text-xs uppercase font-semibold tracking-widest text-[#B5532A]">
                Direct Artisan Enquiry
              </span>
              <h2 className="font-display text-3xl font-semibold text-[#2B3A67] mt-1">
                {item.name}
              </h2>
              <p className="text-xs text-[#2B3A67]/75 mt-1">
                Artisan: {item.artisanName || 'Regional Master Atelier'} • {item.location || 'India'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                  Your Name / Organisation
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditi Sharma"
                  className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm focus:outline-none focus:border-[#B5532A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                  Phone or Email
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. aditi@designstudio.in or +91 98765 43210"
                  className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm focus:outline-none focus:border-[#B5532A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                  Estimated Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm focus:outline-none focus:border-[#B5532A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2B3A67] mb-1">
                  Customisation or delivery notes
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Need natural terracotta finish without chemical sealing by end of next month..."
                  className="w-full px-3.5 py-2.5 border border-[#E4D9C8] rounded-sm text-sm focus:outline-none focus:border-[#B5532A]"
                />
              </div>

              <button type="submit" className="btn-terracotta w-full mt-2">
                Send enquiry directly to artisan
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#B5532A]/15 text-[#B5532A] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-2" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-[#2B3A67]">
              Enquiry sent successfully
            </h3>
            <p className="text-xs text-[#2B3A67]/75 max-w-sm mx-auto">
              The artisan cluster will receive your request directly on WhatsApp / phone with 0% middleman commission.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs px-6 py-2 mt-4"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
