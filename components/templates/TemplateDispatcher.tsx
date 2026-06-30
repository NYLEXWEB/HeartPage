import CoupleTemplate from "./CoupleTemplate";
import FriendTemplate from "./FriendTemplate";
import BreakupTemplate from "./BreakupTemplate";

interface TemplateDispatcherProps {
  category: "couples" | "friends" | "breakup";
  theme: "light" | "dark";
  yourName: string;
  partnerName: string;
  relationshipDate?: string;
  message: string;
  images: string[];
  isPreview?: boolean;
}

export default function TemplateDispatcher({
  category,
  theme,
  yourName,
  partnerName,
  relationshipDate,
  message,
  images,
  isPreview = false,
}: TemplateDispatcherProps) {
  // Safe defaults
  const safeYourName = yourName || (category === "couples" ? "Alex" : category === "friends" ? "Sam" : "Riley");
  const safePartnerName = partnerName || (category === "couples" ? "Jordan" : category === "friends" ? "Taylor" : "Casey");
  const safeRelationshipDate = relationshipDate || (category === "couples" ? "2024-01-01" : category === "friends" ? "2020-09-15" : "2021 - 2025");
  
  const safeMessage = message || (
    category === "couples" 
      ? "Every single day with you is a gift. From the quiet mornings to the wild adventures, you are my home. Here's to us, our past, and our beautiful future."
      : category === "friends"
      ? "You are the cheese to my macaroni, the peanut butter to my jelly, and the partner in crime for all my terrible ideas. Thanks for always being there!"
      : "Sometimes things fall apart so that better things can fall together. Thank you for the lessons, the laughter, and the time we shared. I will always wish you the best, wherever your path leads."
  );

  switch (category) {
    case "couples":
      return (
        <CoupleTemplate
          yourName={safeYourName}
          partnerName={safePartnerName}
          relationshipDate={safeRelationshipDate}
          message={safeMessage}
          images={images}
          theme={theme}
          isPreview={isPreview}
        />
      );
    case "friends":
      return (
        <FriendTemplate
          yourName={safeYourName}
          partnerName={safePartnerName}
          relationshipDate={safeRelationshipDate}
          message={safeMessage}
          images={images}
          theme={theme}
          isPreview={isPreview}
        />
      );
    case "breakup":
      return (
        <BreakupTemplate
          yourName={safeYourName}
          partnerName={safePartnerName}
          relationshipDate={safeRelationshipDate}
          message={safeMessage}
          images={images}
          theme={theme}
          isPreview={isPreview}
        />
      );
    default:
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
          <p>Invalid template selected.</p>
        </div>
      );
  }
}
