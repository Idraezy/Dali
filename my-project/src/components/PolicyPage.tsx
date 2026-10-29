import { useStoreSettings } from "../lib/useStoreSettings";

export type PolicySection = {
  heading: string;
  paragraphs?: string[];
  items?: string[];
};

// Shared layout for the Shipping and Returns pages. Contact details come from
// store_settings so they stay in sync with the Contact page and admin Settings.
function PolicyPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: PolicySection[];
}) {
  const { settings } = useStoreSettings();

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-20 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">{title}</h1>
      <p className="text-gray-500 text-xs mb-6">Last updated {updated}</p>
      <p className="text-gray-400 text-sm leading-relaxed">{intro}</p>

      {sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="text-xl font-bold text-[#00DA6B]">{section.heading}</h2>
          {section.paragraphs?.map((p) => (
            <p key={p} className="mt-3 text-gray-400 text-sm leading-relaxed">
              {p}
            </p>
          ))}
          {section.items && (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-400 text-sm leading-relaxed">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="mt-10 pt-8 border-t border-[#00DA6B]/20">
        <h2 className="text-xl font-bold text-[#00DA6B]">Contact Us</h2>
        <ul className="mt-3 space-y-1 text-gray-400 text-sm">
          <li>
            Email:{" "}
            <a href={`mailto:${settings.contact_email}`} className="text-[#00DA6B] hover:underline">
              {settings.contact_email}
            </a>
          </li>
          <li>Phone: {settings.contact_phone}</li>
          <li>
            WhatsApp:{" "}
            <a href={`https://wa.me/${settings.whatsapp_number}`} className="text-[#00DA6B] hover:underline">
              Message us
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default PolicyPage;
