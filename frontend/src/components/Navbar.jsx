import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './Auth/UserMenu';
import AuthModal from './Auth/AuthModal';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { isAuthenticated } = useAuth();

    return (
        <>
            <motion.nav
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed w-full z-50 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-gray-100 dark:border-dark-border transition-colors duration-200"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-orange-500">
                                SnapCook
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/" className="hover:text-primary dark:text-dark-text dark:hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                            <Link to="/about" className="hover:text-primary dark:text-dark-text dark:hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">About</Link>

                            <ThemeToggle />

                            {isAuthenticated ? (
                                <UserMenu />
                            ) : (
                                <button
                                    onClick={() => setShowAuthModal(true)}
                                    className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-500 transition-colors shadow-lg hover:shadow-xl"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.nav>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </>
    );
};

export default Navbar;
