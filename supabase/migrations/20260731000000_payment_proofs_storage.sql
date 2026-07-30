-- RentIT Masvingo — Phase 14 payment-proofs bucket
-- Run after 20260729000000_storage_setup.sql, same Third-Party Auth prerequisite.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('payment-proofs', 'payment-proofs', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- payment-proofs: private; upload restricted to the submitting user's own
-- folder (path shape: {uid}/{fileName}). Read is any authenticated (Firebase)
-- user rather than self-only, so admins reviewing a submission in the admin
-- dashboard can load the image — same tradeoff already accepted for
-- chat-attachments (no Postgres mirror of admin role yet, see ARCHITECTURE.md).
create policy "authenticated users can read payment proofs"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and auth.jwt()->>'sub' is not null
  );

create policy "users can upload their own payment proof"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.jwt()->>'sub'
  );
