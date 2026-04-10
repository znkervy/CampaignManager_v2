'use client';

import { useState, useEffect } from 'react';
import { Plus, Wallet } from 'lucide-react';
import CampaignCard from '../components/CampaignCard';
import CreateCampaignModal from '../components/CreateCampaignModal';

interface Campaign {
  id: string;
  title: string;
  beneficiary: string;
  raised: number;
  goal: number;
  donors: number;
  endDate: string;
  status: 'Active' | 'Pending' | 'Completed';
}

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/campaigns');
      if (!response.ok) throw new Error('Backend failed to respond');
      
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const totalRaised = campaigns.reduce((sum, c) => sum + (c.raised || 0), 0);

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    fetchCampaigns();
  };

  return (
    <div className="min-h-screen bg-[#FCF9F8]">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#97453E] text-white px-8 py-4 shadow-md z-50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logo_h.png" alt="HOPECARD" className="h-12 w-auto" />
            <span className="font-extrabold text-xl tracking-tight">HOPECARD</span>
          </div>
          
          <nav className="absolute left-1/2 -translate-x-1/2 flex gap-6 text-sm">
            <a href="/" className="hover:text-white/80 font-medium border-b-2 border-white pb-1">Dashboard</a>
            <a href="#" className="hover:text-white/80 font-medium text-white/70">History</a>
            <a href="#" className="hover:text-white/80 font-medium text-white/70">Resources</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="gradient-salmon text-white px-6 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition shadow-sm"
            >
              <Plus size={18} />
              New Campaign
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 px-8 pb-12">
        <div className="max-w-6xl mx-auto p-8 lg:p-12">
          {/* Page Header */}
          <div className="mb-10 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-extrabold text-[#1B1C1B] tracking-tight mb-2">Campaigns</h1>
              <p className="text-[#877270] text-sm">Manage and track your active initiatives.</p>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 shadow-sm border border-[#E5E2E1]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FCF9F8] rounded-lg flex items-center justify-center">
                  <Wallet size={18} className="text-[#97453E]" />
                </div>
                <div>
                  <div className="text-[9px] text-[#877270] uppercase tracking-wider font-semibold mb-0.5">TOTAL RAISED</div>
                  <div className="text-lg font-extrabold text-[#1B1C1B]">
                    ₱{totalRaised.toLocaleString('en-PH')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Grid */}
          {loading ? (
            <div className="text-center py-20 text-[#877270]">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20 text-[#877270] bg-white rounded-2xl border-2 border-dashed border-[#E5E2E1]">
              No campaigns yet. Create your first one!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateCampaignModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={handleCreateSuccess} 
      />
    </div>
  );
}
