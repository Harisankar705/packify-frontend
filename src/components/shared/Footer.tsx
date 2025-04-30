

const Footer = () => {
  return (
    <footer className="bg-[#2D2942] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Content */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold mb-4">Packify</h2>
          <p className="text-gray-400 text-sm max-w-md">
            Your trusted travel partner for unforgettable adventures around the world.
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Packify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
