import { SITE_ASSETS } from "@shared/constants";

export default function Footer() {
  return (
    <footer className="bg-[#010204] border-t border-white/5 py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src={SITE_ASSETS.clubLogo}
              alt="京蔚联"
              className="h-8 w-8 object-contain opacity-60"
            />
            <div>
              <p className="text-white/60 text-sm font-[Oswald] tracking-wider">
                NIO UNITED FC
              </p>
              <p className="text-white/30 text-xs">京蔚联足球俱乐部</p>
            </div>
          </div>
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} 京蔚联足球俱乐部 · Club By Beijing
          </p>
        </div>
      </div>
    </footer>
  );
}
