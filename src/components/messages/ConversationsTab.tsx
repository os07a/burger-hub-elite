import { useEffect, useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { useWhatsappContacts } from "@/hooks/useWhatsappContacts";
import ContactsList from "./ContactsList";
import ChatWindow from "./ChatWindow";

export default function ConversationsTab() {
  const { data: contacts = [], isLoading } = useWhatsappContacts();
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  // Auto-select first contact with messages
  useEffect(() => {
    if (!selectedPhone && contacts.length > 0) {
      const withMessages = contacts.find((c) => c.lastMessageAt);
      if (withMessages) setSelectedPhone(withMessages.phone);
    }
  }, [contacts, selectedPhone]);

  const selectedContact = contacts.find((c) => c.phone === selectedPhone) ?? null;

  if (isLoading) {
    return (
      <div className="ios-card flex items-center justify-center h-[600px] text-muted-foreground">
        <Loader2 size={20} className="animate-spin ml-2" /> جاري تحميل المحادثات…
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="ios-card flex flex-col items-center justify-center h-[600px] text-center">
        <MessageCircle size={48} className="text-muted-foreground/40 mb-3" />
        <div className="text-[14px] font-semibold text-foreground mb-1">لا توجد محادثات بعد</div>
        <div className="text-[11px] text-muted-foreground max-w-sm leading-relaxed">
          ما وصلتك أي رسالة بعد. شارك رقم الواتساب مع عملائك، وستظهر هنا تلقائياً عند بدء المحادثة.
        </div>
      </div>
    );
  }

  return (
    <div className="ios-card p-0 overflow-hidden">
      <div className="grid grid-cols-12 h-[640px]">
        {/* Contacts (right in RTL) */}
        <div className="col-span-4 border-l border-border h-full overflow-hidden">
          <ContactsList
            contacts={contacts}
            selectedPhone={selectedPhone}
            onSelect={setSelectedPhone}
          />
        </div>
        {/* Chat (left in RTL) */}
        <div className="col-span-8 h-full overflow-hidden">
          {selectedContact ? (
            <ChatWindow contact={selectedContact} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageCircle size={40} className="mb-2 opacity-40" />
              <div className="text-[12px]">اختر جهة اتصال للبدء</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
