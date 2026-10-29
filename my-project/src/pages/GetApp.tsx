import { Bell, Coins, MessageCircle, Smartphone, Truck } from "lucide-react";
import { useStoreSettings } from "../lib/useStoreSettings";

const FEATURES = [
  {
    icon: Coins,
    title: "Earn Dali Coins",
    body: "Check in every day to build your streak, and earn coins on delivered orders and when friends you invite shop with us.",
  },
  {
    icon: Truck,
    title: "Track every delivery",
    body: "Follow your order from our hands to your door, with live updates at every step.",
  },
  {
    icon: Bell,
    title: "First to know",
    body: "Get notified the moment new pieces drop.",
  },
  {
    icon: MessageCircle,
    title: "Chat with us",
    body: "Questions about sizing or delivery? Message us right from the app.",
  },
];

function GetApp() {
  const { settings } = useStoreSettings();
  const android = settings.android_app_url;
  const ios = settings.ios_app_url;

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-20 py-16 max-w-4xl mx-auto">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#00DA6B] text-[#001D23] flex items-center justify-center">
          <Smartphone size={32} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mt-6">The Dali Wears App</h1>
        <p className="text-gray-400 mt-4 max-w-md">
          Everything you love about Dali Wears — plus Dali Coins, delivery tracking and new-arrival alerts.
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {android || ios ? (
            <>
              {android && (
                <a
                  href={android}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#00DA6B] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#1d9948] transition"
                >
                  Get it on Google Play
                </a>
              )}
              {ios && (
                <a
                  href={ios}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[#00DA6B] text-[#00DA6B] font-bold px-6 py-3 rounded-lg hover:bg-[#00DA6B]/10 transition"
                >
                  Download on the App Store
                </a>
              )}
            </>
          ) : (
            <span className="border border-gray-700 rounded-full px-5 py-2.5 text-sm text-gray-400">
              Coming soon to Android and iPhone
            </span>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mt-16">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-[#001D23] rounded-xl p-6 border border-[#00DA6B]/10">
            <Icon size={22} className="text-[#00DA6B]" />
            <h2 className="text-lg font-bold mt-3">{title}</h2>
            <p className="text-gray-400 text-sm mt-1">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GetApp;
