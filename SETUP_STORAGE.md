# Supabase Storage Setup for Image Uploads

## Prerequisites
- Supabase project with the `iv_visits` table already created
- Supabase project URL and anon key configured in environment variables

## Storage Bucket Setup

### 1. Create Storage Bucket
1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Name the bucket: `images`
5. Set it as **Public** (so images can be accessed via URL)
6. Click **Create bucket**

### 2. Configure Storage Policies
After creating the bucket, you need to set up Row Level Security (RLS) policies:

#### Policy for Uploading Images
```sql
-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### Policy for Reading Images
```sql
-- Allow public read access to images
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');
```

### 3. Environment Variables
Make sure you have these environment variables set in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Testing the Setup
1. Start your development server: `npm run dev`
2. Navigate to `/admin` in your application
3. Click "Add New Visit"
4. Try uploading an image in the form
5. The image should be uploaded to the `images` bucket and the URL should be saved in the database

## Troubleshooting

### Common Issues:
1. **"Bucket not found" error**: Make sure the bucket name is exactly `images`
2. **"Permission denied" error**: Check that the storage policies are correctly set
3. **"Invalid API key" error**: Verify your environment variables are correct

### Manual Bucket Creation via SQL
If you prefer to create the bucket via SQL:

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Create policies
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');
```

## File Structure
Images will be stored in the following structure:
```
images/
└── visit-images/
    ├── random_filename_1.jpg
    ├── random_filename_2.png
    └── ...
```

The public URL will be automatically generated and stored in the `image_url` field of the `iv_visits` table. 