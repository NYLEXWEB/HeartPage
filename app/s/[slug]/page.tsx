import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWebsiteBySlug } from "@/actions/website";
import TemplateDispatcher from "@/components/templates/TemplateDispatcher";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Dynamically generate SEO metadata for shared public websites
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const website = await getWebsiteBySlug(slug);

  if (!website) {
    return {
      title: "HeartPage | Page Expired or Not Found",
      description: "This website has expired or was removed.",
    };
  }

  const categoryLabel = 
    website.category === "couples" 
      ? "Love Space" 
      : website.category === "friends" 
      ? "Friendship Space" 
      : website.category === "breakup"
      ? "Breakup Memory"
      : website.category === "crush"
      ? "Secret Confession"
      : website.category === "wedding"
      ? "Wedding Invitation"
      : "Birthday Tribute";

  const title = `${website.yourName} & ${website.partnerName} | ${categoryLabel} on HeartPage`;
  const description = `${website.yourName} shared a beautiful, personalized ${categoryLabel.toLowerCase()} dedicated to ${website.partnerName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://heartpage.vercel.app"}/s/${slug}`,
      images: [
        {
          url: website.images?.[0] || "/og-image.png",
          width: 800,
          height: 600,
          alt: `${website.yourName} & ${website.partnerName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [website.images?.[0] || "/og-image.png"],
    },
  };
}

export default async function PublicWebsitePage({ params }: PageProps) {
  const { slug } = await params;
  const website = await getWebsiteBySlug(slug);

  // If page does not exist or has expired, trigger Next.js notFound()
  if (!website) {
    notFound();
  }

  return (
    <TemplateDispatcher
      category={website.category}
      theme={website.theme}
      yourName={website.yourName}
      partnerName={website.partnerName}
      relationshipDate={website.relationshipDate}
      message={website.message}
      images={website.images}
      customFields={website.customFields || []}
      groomPhoto={website.groomPhoto}
      bridePhoto={website.bridePhoto}
      isPreview={false}
      musicEnabled={website.musicEnabled}
      selectedMusic={website.selectedMusic}
    />
  );
}
