import CoupleTemplate from "./CoupleTemplate";
import FriendTemplate from "./FriendTemplate";
import BreakupTemplate from "./BreakupTemplate";
import CrushTemplate from "./CrushTemplate";
import BirthdayTemplate from "./BirthdayTemplate";
import WeddingTemplate from "./WeddingTemplate";

interface TemplateDispatcherProps {
  category: "couples" | "friends" | "breakup" | "crush" | "birthday" | "wedding";
  theme: "light" | "dark";
  yourName: string;
  partnerName: string;
  relationshipDate?: string;
  message: string;
  images: string[];
  customFields?: { label: string; value: string }[];
  groomPhoto?: string;
  bridePhoto?: string;
  isPreview?: boolean;
  isFullPreview?: boolean;
  musicEnabled?: boolean;
  hideMusicPlayer?: boolean;
}

export default function TemplateDispatcher({
  category,
  theme,
  yourName,
  partnerName,
  relationshipDate,
  message,
  images,
  customFields = [],
  groomPhoto,
  bridePhoto,
  isPreview = false,
  isFullPreview = false,
  musicEnabled = true,
  hideMusicPlayer = false,
}: TemplateDispatcherProps) {
  // Safe defaults
  const safeYourName = yourName || (
    category === "couples" 
      ? "Alex" 
      : category === "friends" 
      ? "Sam" 
      : category === "breakup"
      ? "Riley"
      : category === "crush"
      ? "Confessor"
      : category === "wedding"
      ? "Groom"
      : "Wisher"
  );
  
  const safePartnerName = partnerName || (
    category === "couples" 
      ? "Jordan" 
      : category === "friends" 
      ? "Taylor" 
      : category === "breakup"
      ? "Casey"
      : category === "crush"
      ? "My Crush"
      : category === "wedding"
      ? "Bride"
      : "Birthday Star"
  );
  
  const safeRelationshipDate = relationshipDate || (
    category === "couples" 
      ? "2024-01-01" 
      : category === "friends" 
      ? "2020-09-15" 
      : category === "breakup"
      ? "2021 - 2025"
      : category === "crush"
      ? "2026-02-14"
      : category === "wedding"
      ? "2026-12-25"
      : "2000-01-01"
  );
  
  const safeMessage = message || (
    category === "couples" 
      ? "Every single day with you is a gift. From the quiet mornings to the wild adventures, you are my home. Here's to us, our past, and our beautiful future."
      : category === "friends"
      ? "You are the cheese to my macaroni, the peanut butter to my jelly, and the partner in crime for all my terrible ideas. Thanks for always being there!"
      : category === "breakup"
      ? "Sometimes things fall apart so that better things can fall together. Thank you for the lessons, the laughter, and the time we shared. I will always wish you the best, wherever your path leads."
      : category === "crush"
      ? "I've been holding onto this feeling for a while now, and I couldn't keep it to myself anymore. You are incredible, and I would love the chance to make beautiful memories with you."
      : category === "wedding"
      ? "We invite you to share in our joy and celebrate our union as we take our vows and start our forever together. Save the date and join us on our special day!"
      : "Happy Birthday! May your day be filled with laughter, love, cake, and all the beautiful things you deserve. Thank you for being such an amazing person!"
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
          customFields={customFields}
          isPreview={isPreview}
          isFullPreview={isFullPreview}
          musicEnabled={musicEnabled}
          hideMusicPlayer={hideMusicPlayer}
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
          customFields={customFields}
          isPreview={isPreview}
          isFullPreview={isFullPreview}
          musicEnabled={musicEnabled}
          hideMusicPlayer={hideMusicPlayer}
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
          customFields={customFields}
          isPreview={isPreview}
          isFullPreview={isFullPreview}
          musicEnabled={musicEnabled}
          hideMusicPlayer={hideMusicPlayer}
        />
      );
    case "crush":
      return (
        <CrushTemplate
          yourName={safeYourName}
          partnerName={safePartnerName}
          relationshipDate={safeRelationshipDate}
          message={safeMessage}
          images={images}
          theme={theme}
          customFields={customFields}
          isPreview={isPreview}
          musicEnabled={musicEnabled}
          hideMusicPlayer={hideMusicPlayer}
        />
      );
    case "birthday":
      return (
        <BirthdayTemplate
          yourName={safeYourName}
          partnerName={safePartnerName}
          relationshipDate={safeRelationshipDate}
          message={safeMessage}
          images={images}
          theme={theme}
          customFields={customFields}
          isPreview={isPreview}
          birthdayPhoto={groomPhoto}
          musicEnabled={musicEnabled}
          hideMusicPlayer={hideMusicPlayer}
        />
      );
    case "wedding":
      return (
        <WeddingTemplate
          yourName={safeYourName}
          partnerName={safePartnerName}
          relationshipDate={safeRelationshipDate}
          message={safeMessage}
          images={images}
          theme={theme}
          customFields={customFields}
          groomPhoto={groomPhoto}
          bridePhoto={bridePhoto}
          isPreview={isPreview}
          musicEnabled={musicEnabled}
          hideMusicPlayer={hideMusicPlayer}
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
