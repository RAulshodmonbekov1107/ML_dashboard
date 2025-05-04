import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { modelEndpoints } from '../../services/api';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16L12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 7L12 7.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" fill="currentColor"/>
              </svg>
              <span className="font-bold text-xl">ML Showcase</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/' ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'
                }`}
              >
                Home
              </Link>
              
              <div className="relative group">
                <button className="px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-800 focus:outline-none">
                  Regression
                </button>
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                  <div className="py-1">
                    {modelEndpoints.regression.map((model) => (
                      <Link
                        key={model.endpoint}
                        to={`/model/${model.endpoint}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-900"
                        onClick={closeMobileMenu}
                      >
                        {model.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <button className="px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-800 focus:outline-none">
                  Classification
                </button>
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                  <div className="py-1">
                    {modelEndpoints.classification.map((model) => (
                      <Link
                        key={model.endpoint}
                        to={`/model/${model.endpoint}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-900"
                        onClick={closeMobileMenu}
                      >
                        {model.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <button className="px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-800 focus:outline-none">
                  Ensemble
                </button>
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                  <div className="py-1">
                    {modelEndpoints.ensemble.map((model) => (
                      <Link
                        key={model.endpoint}
                        to={`/model/${model.endpoint}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-900"
                        onClick={closeMobileMenu}
                      >
                        {model.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <button className="px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-800 focus:outline-none">
                  Neural Networks
                </button>
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                  <div className="py-1">
                    {modelEndpoints.neuralNetwork.map((model) => (
                      <Link
                        key={model.endpoint}
                        to={`/model/${model.endpoint}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 hover:text-indigo-900"
                        onClick={closeMobileMenu}
                      >
                        {model.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <Link 
                to="/dashboard" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/dashboard' ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'
                }`}
              >
                Dashboard
              </Link>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-100 hover:text-white hover:bg-indigo-800 focus:outline-none"
            >
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              location.pathname === '/' ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'
            }`}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
            
          {/* Mobile dropdown - Regression */}
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-800 focus:outline-none">
              Regression
            </button>
            <div className="pl-4 space-y-1">
              {modelEndpoints.regression.map((model) => (
                <Link
                  key={model.endpoint}
                  to={`/model/${model.endpoint}`}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-800"
                  onClick={closeMobileMenu}
                >
                  {model.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Mobile dropdown - Classification */}
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-800 focus:outline-none">
              Classification
            </button>
            <div className="pl-4 space-y-1">
              {modelEndpoints.classification.map((model) => (
                <Link
                  key={model.endpoint}
                  to={`/model/${model.endpoint}`}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-800"
                  onClick={closeMobileMenu}
                >
                  {model.name}
                </Link>
              ))}
            </div>
          </div>
            
          {/* Mobile dropdown - Ensemble */}
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-800 focus:outline-none">
              Ensemble
            </button>
            <div className="pl-4 space-y-1">
              {modelEndpoints.ensemble.map((model) => (
                <Link
                  key={model.endpoint}
                  to={`/model/${model.endpoint}`}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-800"
                  onClick={closeMobileMenu}
                >
                  {model.name}
                </Link>
              ))}
            </div>
          </div>
            
          {/* Mobile dropdown - Neural Networks */}
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-800 focus:outline-none">
              Neural Networks
            </button>
            <div className="pl-4 space-y-1">
              {modelEndpoints.neuralNetwork.map((model) => (
                <Link
                  key={model.endpoint}
                  to={`/model/${model.endpoint}`}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-indigo-100 hover:bg-indigo-800"
                  onClick={closeMobileMenu}
                >
                  {model.name}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/dashboard"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              location.pathname === '/dashboard' ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-800'
            }`}
            onClick={closeMobileMenu}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 