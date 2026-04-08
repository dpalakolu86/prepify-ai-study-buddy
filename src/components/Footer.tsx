import logo from "@/assets/prepify-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Prepify AI" className="h-8 w-auto" />
            <span className="text-lg font-bold text-gradient">Prepify AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Prepify AI. Free for all students.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
