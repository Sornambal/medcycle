import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Search } from 'lucide-react';

export default function RoleSelection() {
  const [, setLocation] = useLocation();

  const handleSenderRole = () => {
    setLocation('/sender/dashboard');
  };

  const handleReceiverRole = () => {
    setLocation('/receiver/dashboard');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">What would you like to do today?</h1>
          <p className="text-lg text-gray-600">Choose your role to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={handleSenderRole}>
            <CardContent className="p-8 text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Send className="text-blue-600 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Medicines</h2>
              <p className="text-gray-600 mb-6">
                List your near-expiry medicines for redistribution to other healthcare providers
              </p>
              <Button className="bg-blue-600 text-white px-8 py-3 hover:bg-blue-700">
                I want to Send Medicines
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow cursor-pointer" onClick={handleReceiverRole}>
            <CardContent className="p-8 text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Search className="text-green-600 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Receive Medicines</h2>
              <p className="text-gray-600 mb-6">
                Search and purchase medicines from nearby healthcare providers at reduced costs
              </p>
              <Button className="bg-green-600 text-white px-8 py-3 hover:bg-green-700">
                I want to Receive Medicines
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
