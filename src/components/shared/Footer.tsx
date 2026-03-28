"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Shield, Globe, Mail } from "lucide-react";

export function Footer() {
  const locale = useLocale();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-msc flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-white text-lg">
                MyStep<span className="text-amber-400">Change</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Connecting international talent with German employers. Privacy-first, GDPR-compliant recruitment platform.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                GDPR Compliant
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                EU Data Storage
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/jobs`} className="hover:text-white transition-colors">Find Jobs</Link></li>
              <li><Link href={`/${locale}/register`} className="hover:text-white transition-colors">Register</Link></li>
              <li><Link href={`/${locale}/login`} className="hover:text-white transition-colors">Log In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                info@mystepchange.de
              </li>
              <li className="text-gray-500 text-xs mt-3">
                mystepchange.de
                <br />
                mystepchange.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} MyStepChange GmbH. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="#" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-300">Impressum</Link>
            <Link href="#" className="hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
