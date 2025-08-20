import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Pill, Shield, MapPin, Recycle, Heart, Gift, Users, Phone, Mail, MapPin as MapPinIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Landing() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-teal-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Pill className="text-white text-4xl lg:text-6xl mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                MedCycle
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              AI-Powered Medicine Redistribution Network - Reducing pharmaceutical waste and improving medicine accessibility in India
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50">
                  <i className="fas fa-user-plus mr-2"></i>Sign Up
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <i className="fas fa-sign-in-alt mr-2"></i>Login
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button size="lg" className="bg-green-600 text-white hover:bg-green-700">
                  <i className="fas fa-cog mr-2"></i>Admin Login
                </Button>
              </Link>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-blue-100">
                Admin credentials: username: admin, password: admin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose MedCycle?</h2>
            <p className="text-lg text-gray-600">Secure, efficient, and transparent medicine redistribution</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-blue-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Verification</h3>
              <p className="text-gray-600">Automated verification of healthcare entities and medicine authenticity using advanced AI</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-teal-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Location-Based Matching</h3>
              <p className="text-gray-600">Smart geolocation matching to connect nearby healthcare providers efficiently</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Recycle className="text-green-600 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reduce Waste</h3>
              <p className="text-gray-600">Minimize pharmaceutical waste by redistributing near-expiry medicines</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600">Transforming healthcare through medicine redistribution</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-bold text-blue-600 mb-6">How Will Medicine Donation Help?</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Heart className="text-red-500 w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Save Lives in Rural Areas</h4>
                    <p className="text-gray-600">Your donated medicines reach underserved rural communities where access to essential drugs is limited, potentially saving countless lives.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Recycle className="text-green-500 w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Reduce Pharmaceutical Waste</h4>
                    <p className="text-gray-600">Prevent safe, unused medicines from being discarded, contributing to environmental sustainability and reducing healthcare costs.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="text-blue-500 w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Emergency Medicine Supply</h4>
                    <p className="text-gray-600">Provide critical medicines during emergencies and natural disasters when supply chains are disrupted.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="text-purple-500 w-6 h-6 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Bridge Healthcare Gaps</h4>
                    <p className="text-gray-600">Connect surplus medicine holders with healthcare providers in need, creating a sustainable healthcare ecosystem.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <img src="C:\Users\SORNAMBAL\Downloads\hard\1@med.png" 
                   alt="Medicine Donation" 
                   className="w-full h-64 object-cover rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* How to Donate & Receive Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Donate & Receive?</h2>
            <p className="text-lg text-gray-600">Simple steps to participate in medicine redistribution</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center">
                <Gift className="w-6 h-6 mr-2" />
                For Donors (Senders)
              </h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1 flex-shrink-0">1</span>
                  <div>
                    <h4 className="font-semibold">Register & Verify</h4>
                    <p className="text-gray-600">Sign up as a healthcare entity and complete AI-powered verification</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1 flex-shrink-0">2</span>
                  <div>
                    <h4 className="font-semibold">List Medicines</h4>
                    <p className="text-gray-600">Upload medicine details with photos for AI verification</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1 flex-shrink-0">3</span>
                  <div>
                    <h4 className="font-semibold">Get Approved</h4>
                    <p className="text-gray-600">Wait for admin approval of your medicine listings</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1 flex-shrink-0">4</span>
                  <div>
                    <h4 className="font-semibold">Ship & Track</h4>
                    <p className="text-gray-600">Ship medicines to verified receivers and track delivery</p>
                  </div>
                </li>
              </ol>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-blue-600 mb-6 flex items-center">
                <MapPinIcon className="w-6 h-6 mr-2" />
                For Receivers
              </h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1 flex-shrink-0">1</span>
                  <div>
                    <h4 className="font-semibold">Register & Verify</h4>
                    <p className="text-gray-600">Sign up as a healthcare entity and complete verification</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1 flex-shrink-0">2</span>
                  <div>
                    <h4 className="font-semibold">Search Medicines</h4>
                    <p className="text-gray-600">Browse available medicines by name, location, and expiry</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1 flex-shrink-0">3</span>
                  <div>
                    <h4 className="font-semibold">Add to Cart</h4>
                    <p className="text-gray-600">Select required medicines and quantities</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1 flex-shrink-0">4</span>
                  <div>
                    <h4 className="font-semibold">Order & Receive</h4>
                    <p className="text-gray-600">Complete payment and receive medicines at your location</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About Us</h2>
            <p className="text-lg text-gray-600">MedCycle - Revolutionizing Healthcare Access</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 mb-4">
                MedCycle is India's first AI-powered medicine redistribution network designed to create a secure, efficient, and transparent platform for redistributing sealed, safe, near-expiry medicines between verified healthcare entities.
              </p>
              <p className="text-gray-600 mb-4">
                We bridge the gap between surplus medicine holders and healthcare providers in need, reducing pharmaceutical waste while improving medicine accessibility in rural regions and emergency situations.
              </p>
              <p className="text-gray-600">
                Our platform serves Hospitals, Pharmacies, and Medical Shops across India, ensuring that no safe medicine goes to waste while patients in need get access to essential medications.
              </p>
            </div>
            
            <div>
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                   alt="Healthcare Team" 
                   className="w-full h-64 object-cover rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-600">Get in touch with our team</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-blue-600 mb-6">Send us a message</h3>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData);
                
                // Send email functionality
                fetch('/api/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    subject: data.subject,
                    message: data.message,
                    to: 'sornap2005@gmail.com'
                  })
                }).then(() => {
                  alert('Message sent successfully!');
                  (e.target as HTMLFormElement).reset();
                });
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input type="text" name="name" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" name="email" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" name="phone" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input type="text" name="subject" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea name="message" rows={4} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  Send Message
                </Button>
              </form>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-blue-600 mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPinIcon className="text-blue-600 w-5 h-5 mr-3" />
                  <span className="text-gray-700">Coimbatore, Tamil Nadu, India</span>
                </div>
                <div className="flex items-center">
                  <Phone className="text-blue-600 w-5 h-5 mr-3" />
                  <span className="text-gray-700">+91 9361106696</span>
                </div>
                <div className="flex items-center">
                  <Mail className="text-blue-600 w-5 h-5 mr-3" />
                  <span className="text-gray-700">sornambalp97@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Medicine Donation</h3>
              <ul className="space-y-2">
                <li><Link href="/register" className="text-gray-300 hover:text-white">Register as Donor</Link></li>
                <li><Link href="/register" className="text-gray-300 hover:text-white">Register as Receiver</Link></li>
                <li><Link href="/login" className="text-gray-300 hover:text-white">Login</Link></li>
                <li><Link href="/admin/login" className="text-gray-300 hover:text-white">Admin Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/faq" className="text-gray-300 hover:text-white">FAQ</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-300">Coimbatore, Tamil Nadu</li>
                <li className="text-gray-300">+91 9361106696</li>
                <li className="text-gray-300">sornambalp97@gmail.com</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Have a Question?</h3>
              <p className="text-gray-300 mb-4">We're here to help!</p>
              <Link href="#contact">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              Copyright ©2025 All rights reserved | MedCycle
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
