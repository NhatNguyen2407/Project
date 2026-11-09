import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { filterAdminInquiries, getInquiryReferenceUrl } from '../../utils/adminInquiries';

export function InquiryDetails({ inquiry, date }) {
  const referenceUrl = getInquiryReferenceUrl(inquiry.image_link);
  return (
    <>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ['Inquiry ID', inquiry.id], ['Customer name', inquiry.customer_name],
          ['Email', inquiry.customer_email], ['Contact', inquiry.contact_info],
          ['Product', inquiry.product_name], ['Size', inquiry.size],
          ['Quantity', inquiry.quantity], ['Accessories per unit', inquiry.accessory_qty],
          ['Submitted', date],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words font-medium">{value ?? 'Not provided'}</dd>
          </div>
        ))}
      </dl>
      <div>
        <h2 className="text-sm font-bold text-[var(--muted-foreground)]">Additional notes</h2>
        <p className="mt-1 whitespace-pre-wrap break-words">{inquiry.note || 'No additional notes.'}</p>
      </div>
      <div>
        {referenceUrl ? (
          <a href={referenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl border border-[var(--border)] px-4 py-2 font-bold text-[var(--primary)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">Open design reference (new tab)</a>
        ) : <p className="text-sm text-[var(--muted-foreground)]">Design reference unavailable.</p>}
      </div>
    </>
  );
}

export function AdminInquiries({ inquiries, onRefresh }) {
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(25);
  // shortcut: Search covers the existing Admin batch; add server pagination before the API row limit is reached.
  const filtered = filterAdminInquiries(inquiries, search);

  return (
    <section aria-labelledby="admin-inquiries-title" className="space-y-5 text-[var(--foreground)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 id="admin-inquiries-title" className="text-2xl font-bold">Customer inquiries</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Newest first. Open a request to view its details.</p>
        </div>
        <button type="button" onClick={onRefresh} className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2 font-bold hover:bg-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer">
          <RefreshCw aria-hidden="true" className="size-4" /> Refresh inquiries
        </button>
      </div>

      <div className="space-y-2">
        <label htmlFor="inquiry-search" className="block text-sm font-bold">Search inquiries</label>
        <input id="inquiry-search" type="search" value={search} onChange={event => { setSearch(event.target.value); setVisibleCount(25); }} placeholder="Subject, customer, email, product or inquiry ID" className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]" />
      </div>

      <p role="status" className="text-sm text-[var(--muted-foreground)]">Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} inquiries</p>
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">{search.trim() ? 'No inquiries match your search.' : 'No inquiries yet.'}</p>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {filtered.slice(0, visibleCount).map(inquiry => {
            const createdAt = new Date(inquiry.created_at);
            const date = !inquiry.created_at || Number.isNaN(createdAt.getTime()) ? 'Date unavailable' : createdAt.toLocaleString();
            return (
              <AccordionItem key={inquiry.id} value={inquiry.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 sm:px-6">
                <AccordionTrigger className="min-h-11 text-base">
                  <span className="min-w-0 space-y-1">
                    <span className="block break-words font-bold">{inquiry.subject || 'Untitled inquiry'}</span>
                    <span className="block break-all text-sm text-[var(--muted-foreground)]">{inquiry.customer_name} - {inquiry.customer_email}</span>
                    <span className="block text-sm text-[var(--muted-foreground)]">{date}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-5 text-base">
                  <InquiryDetails inquiry={inquiry} date={date} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
      {visibleCount < filtered.length && (
        <button type="button" onClick={() => setVisibleCount(count => count + 25)} className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-2 font-bold hover:bg-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer">Show more inquiries</button>
      )}
    </section>
  );
}
