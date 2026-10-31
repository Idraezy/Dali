import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";

const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

interface Copy {
  icon: LucideIcon;
  kicker: string;
  title: string;
  body: ReactNode;
}

interface Slide {
  image: string;
  alt: string;
  // Desktop: where the photo enters from and where it settles, in thirds of
  // the strip (0 = left, 1 = middle, 2 = right).
  from: number;
  to: number;
  // Desktop: the write-up blocks and where each one sits.
  copy: { block: Copy; className: string }[];
}

const SLIDES: Slide[] = [
  {
    image: "/home/paystack.webp",
    alt: "A Dali Wears bag next to a phone showing a successful Paystack payment",
    from: 1,
    to: 0,
    copy: [
      {
        className: "left-[38%] right-0 text-left",
        block: {
          icon: ShieldCheck,
          kicker: "Secure checkout",
          title: "Pay with confidence through Paystack",
          body: (
            <>
              Every payment on Dali Wears is handled by Paystack, one of Africa&apos;s leading
              payment providers. Your card details go straight to Paystack over an encrypted
              connection and are never stored by us. You get an instant confirmation, and every
              order is checked against what you actually paid.
            </>
          ),
        },
      },
    ],
  },
  {
    image: "/home/support.webp",
    alt: "A Dali Wears support agent chatting with a customer",
    from: 2,
    to: 1,
    copy: [
      {
        className: "left-0 w-[30%] text-right",
        block: {
          icon: MessageCircle,
          kicker: "Direct support",
          title: "Real people, real answers",
          body: (
            <>
              Chat with our team right here on the site. No bots and no scripts, just someone who
              knows every piece we sell.
            </>
          ),
        },
      },
      {
        className: "right-0 w-[30%] text-left",
        block: {
          icon: MessageCircle,
          kicker: "We're here to help",
          title: "Sizing, orders and delivery",
          body: (
            <>
              Not sure about a size, or want to know where your order is? Message us and track
              every order from your account.
            </>
          ),
        },
      },
    ],
  },
  {
    image: "/home/care.webp",
    alt: "A Dali Wears shirt with its woven label and swing tag",
    from: 0,
    to: 2,
    copy: [
      {
        className: "left-0 right-[38%] text-left",
        block: {
          icon: Sparkles,
          kicker: "Made with care",
          title: "Chosen piece by piece",
          body: (
            <>
              Every item is checked for fabric, stitching and finish before it reaches our
              shelves, then packed with care so it arrives ready to wear. If something isn&apos;t
              right, our{" "}
              <Link to="/returns" className="text-[#00DA6B] underline underline-offset-2">
                returns policy
              </Link>{" "}
              has you covered.
            </>
          ),
        },
      },
    ],
  },
];

const INTERVAL_MS = 3000;
// How far a finger has to travel sideways to count as a swipe.
const SWIPE_PX = 40;
const FADE_MS = 700;

function CopyBlock({ block, align }: { block: Copy; align?: "right" }) {
  const Icon = block.icon;
  return (
    <div className={cn("flex flex-col gap-3", align === "right" && "items-end")}>
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#00DA6B]">
        <Icon className="size-4" strokeWidth={1.5} />
        {block.kicker}
      </span>
      <h3 className="text-2xl font-bold leading-tight text-white xl:text-3xl">{block.title}</h3>
      <p className="text-sm leading-relaxed text-gray-400">{block.body}</p>
    </div>
  );
}

// Home page strip: three photos that take turns sliding across, each with
// its write-up fading in beside it. Below the lg breakpoint the photo sits
// above the text instead. Advances every 3 seconds, or by swiping.
export default function TrustSlideshow() {
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const goTo = (next: number) => {
    if (next === active) return;
    setLeaving(active);
    setActive(next);
    clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setLeaving(null), FADE_MS);
  };

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => goTo((active + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearTimeout(id);
    // goTo only depends on `active`, which is listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused]);

  useEffect(() => () => clearTimeout(leaveTimer.current), []);

  // Swipe left for the next slide, right for the previous one. Mostly
  // vertical drags are left alone so the page still scrolls.
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    setPaused(true);
  };

  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    setPaused(false);
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    const step = dx < 0 ? 1 : SLIDES.length - 1;
    goTo((active + step) % SLIDES.length);
  };

  const photoStyle = (i: number, slide: Slide) => {
    if (i === active) return { transform: `translateX(${slide.to * 100}%)`, opacity: 1 };
    if (i === leaving) return { transform: `translateX(${slide.to * 100}%)`, opacity: 0 };
    return { transform: `translateX(${slide.from * 100}%)`, opacity: 0 };
  };

  return (
    <section
      className="py-14 sm:py-20"
      aria-roledescription="carousel"
      aria-label="Why shop with Dali Wears"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => {
        touchStart.current = null;
        setPaused(false);
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold sm:text-4xl">
          Why shop with <span className="text-[#00DA6B]">Dali Wears</span>
        </h2>
        {/* Desktop: photos travel across a strip three photos wide. */}
        <div className="relative hidden aspect-[3/1] lg:block">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.image}
              aria-hidden={i !== active}
              style={photoStyle(i, slide)}
              className={cn(
                "absolute inset-y-0 left-0 w-1/3",
                i === active &&
                  "transition-[transform,opacity] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                i === leaving && "transition-opacity duration-700 motion-reduce:transition-none"
              )}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                loading="lazy"
                className="size-full object-contain drop-shadow-xl"
              />
            </div>
          ))}

          {SLIDES.map((slide, i) =>
            slide.copy.map(({ block, className }, j) => (
              <div
                key={`${i}-${j}`}
                aria-hidden={i !== active}
                className={cn(
                  "absolute top-1/2 px-6 transition-[transform,opacity] duration-700 ease-out motion-reduce:transition-none xl:px-10",
                  className,
                  i === active
                    ? "-translate-y-1/2 opacity-100 delay-500"
                    : cn(
                        "pointer-events-none opacity-0",
                        className.includes("text-right") ? "-translate-x-6" : "translate-x-6",
                        "-translate-y-1/2"
                      )
                )}
              >
                <CopyBlock block={block} align={className.includes("text-right") ? "right" : undefined} />
              </div>
            ))
          )}
        </div>

        {/* Phones and tablets: photo on top, write-up underneath. Every slide
            shares one grid cell so the height doesn't jump between them. */}
        <div className="grid lg:hidden">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.image}
              aria-hidden={i !== active}
              className={cn(
                "flex flex-col gap-8 transition-[transform,opacity] duration-700 ease-out [grid-area:1/1] motion-reduce:transition-none",
                i === active ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-8 opacity-0"
              )}
            >
              <div className="relative mx-auto aspect-square w-full max-w-sm">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  loading="lazy"
                  className="size-full object-contain drop-shadow-xl"
                />
              </div>
              <div className="flex flex-col gap-8 sm:flex-row">
                {slide.copy.map(({ block }, j) => (
                  <div key={j} className="flex-1">
                    <CopyBlock block={block} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show slide ${i + 1}: ${slide.copy[0].block.kicker}`}
              aria-current={i === active}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === active ? "w-8 bg-[#00DA6B]" : "w-3 bg-gray-600 hover:bg-gray-400"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
