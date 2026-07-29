-- RentIT Masvingo — Supabase Storage setup
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- after creating the project and enabling Firebase as a Third-Party Auth
-- provider (Dashboard > Authentication > Sign In / Providers > Third Party
-- Auth > add your Firebase project ID). Without that step, auth.jwt() will
-- not recognize the Firebase ID token the app sends and every policy below
-- will simply deny access.

-- 1. Create buckets ----------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('property-photos', 'property-photos', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('agency-logos', 'agency-logos', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('verification-documents', 'verification-documents', false, 15728640, null),
  ('chat-attachments', 'chat-attachments', false, 10485760, null)
on conflict (id) do nothing;

-- 2. Policies ------------------------------------------------------------
-- `auth.jwt()->>'sub'` is the Firebase UID once Third-Party Auth is wired up.

-- property-photos: public read; write restricted to the path owner.
-- Path shape: {landlord|agency}/{ownerId}/{propertyId}/{fileName}
-- NOTE: for ownerType = 'agency', ownerId is the agency's Firestore doc id,
-- not a Firebase UID, so this policy currently only enforces ownership for
-- the *landlord* branch. Agency staff uploads are unrestricted at the
-- storage layer until Phase 11 introduces either a Cloud Function bridge or
-- a Postgres table mirroring agency membership — see ARCHITECTURE.md.
create policy "property photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'property-photos');

create policy "landlords can upload their own property photos"
  on storage.objects for insert
  with check (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = 'landlord'
    and (storage.foldername(name))[2] = auth.jwt()->>'sub'
  );

create policy "agency members can upload property photos (unrestricted for now)"
  on storage.objects for insert
  with check (
    bucket_id = 'property-photos'
    and (storage.foldername(name))[1] = 'agency'
    and auth.jwt()->>'sub' is not null
  );

-- avatars: public read; self-only write. Path shape: {uid}/{fileName}
create policy "avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.jwt()->>'sub'
  );

create policy "users can replace their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.jwt()->>'sub'
  );

-- agency-logos: public read; only the agency owner writes (path = ownerUid).
create policy "agency logos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'agency-logos');

create policy "agency owners can upload their logo"
  on storage.objects for insert
  with check (
    bucket_id = 'agency-logos'
    and (storage.foldername(name))[1] = auth.jwt()->>'sub'
  );

-- verification-documents: private, self-only. Path shape: {uid}/{fileName}
-- Admin review access is out of scope here — admins review through the
-- Supabase dashboard directly until Phase 8 builds proper tooling.
create policy "users can read their own verification documents"
  on storage.objects for select
  using (
    bucket_id = 'verification-documents'
    and (storage.foldername(name))[1] = auth.jwt()->>'sub'
  );

create policy "users can upload their own verification documents"
  on storage.objects for insert
  with check (
    bucket_id = 'verification-documents'
    and (storage.foldername(name))[1] = auth.jwt()->>'sub'
  );

-- chat-attachments: private; any authenticated (Firebase) user for now.
-- Path shape: {conversationId}/{fileName}. Real "is a participant in this
-- conversation" enforcement needs a Postgres mirror of conversation
-- membership, deferred alongside the agency case above.
create policy "authenticated users can read chat attachments"
  on storage.objects for select
  using (
    bucket_id = 'chat-attachments'
    and auth.jwt()->>'sub' is not null
  );

create policy "authenticated users can upload chat attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-attachments'
    and auth.jwt()->>'sub' is not null
  );
