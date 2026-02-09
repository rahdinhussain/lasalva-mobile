import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ExternalLink,
  FileText,
} from 'lucide-react-native';
import { useBillingSummary, openBillingPortal } from '@/hooks/useBilling';
import { useBusiness } from '@/context/BusinessContext';
import { Header } from '@/components/layout';
import { Button, Card, Badge, SkeletonCard, ErrorState } from '@/components/ui';
import { formatCurrency } from '@/utils/formatters';
import { formatDate } from '@/utils/dateUtils';
import { colors } from '@/constants/colors';

const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof CheckCircle }> = {
  active: { color: colors.emerald[600], bgColor: 'bg-emerald-50', icon: CheckCircle },
  trialing: { color: colors.indigo[600], bgColor: 'bg-indigo-50', icon: Clock },
  pending: { color: colors.amber[600], bgColor: 'bg-amber-50', icon: AlertCircle },
  canceled: { color: colors.rose[600], bgColor: 'bg-rose-50', icon: AlertCircle },
  past_due: { color: colors.rose[600], bgColor: 'bg-rose-50', icon: AlertCircle },
};

export default function BillingSettingsScreen() {
  const { business } = useBusiness();
  const { billing, isLoading, error, refetch } = useBillingSummary();

  const handleOpenPortal = async () => {
    try {
      await openBillingPortal('/settings/billing');
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    }
  };

  const handleViewInvoice = (pdfUrl: string) => {
    Linking.openURL(pdfUrl);
  };

  if (error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Billing" showBack />
        <ErrorState message="Failed to load billing information" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
        <Header title="Billing" showBack />
        <View className="p-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  const status = business?.subscription_status || 'pending';
  const statusStyle = statusConfig[status] || statusConfig.pending;
  const StatusIcon = statusStyle.icon;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      <Header title="Billing" showBack />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan */}
        <Card className="mb-4 overflow-hidden">
          <View className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
            <View style={{ backgroundColor: colors.indigo[600] }} className="absolute inset-0" />
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-indigo-100">Current Plan</Text>
                <Text className="text-2xl font-bold text-white mt-1">
                  {business?.plan_name || 'Free Plan'}
                </Text>
              </View>
              <View className={`${statusStyle.bgColor} px-3 py-1.5 rounded-full flex-row items-center gap-1.5`}>
                <StatusIcon size={14} color={statusStyle.color} />
                <Text style={{ color: statusStyle.color }} className="text-sm font-medium capitalize">
                  {status.replace('_', ' ')}
                </Text>
              </View>
            </View>
          </View>
          
          <Card.Content className="pt-4">
            {billing && (
              <View className="gap-3">
                {billing.currentPeriodStart && (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Calendar size={16} color={colors.slate[500]} />
                      <Text className="text-sm text-slate-500">Current Period</Text>
                    </View>
                    <Text className="text-sm font-medium text-slate-900">
                      {formatDate(billing.currentPeriodStart, 'MMM d')} - {formatDate(billing.currentPeriodEnd, 'MMM d, yyyy')}
                    </Text>
                  </View>
                )}
                
                {billing.nextPaymentDate && (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <CreditCard size={16} color={colors.slate[500]} />
                      <Text className="text-sm text-slate-500">Next Payment</Text>
                    </View>
                    <Text className="text-sm font-medium text-slate-900">
                      {formatCurrency(billing.amount || 0, billing.currency)} on {formatDate(billing.nextPaymentDate, 'MMM d, yyyy')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Manage Subscription */}
        <Card className="p-4 mb-4">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-full bg-indigo-50 items-center justify-center">
              <CreditCard size={20} color={colors.indigo[600]} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-slate-900">
                Manage Subscription
              </Text>
              <Text className="text-sm text-slate-500">
                Update payment method, change plan, or cancel
              </Text>
            </View>
          </View>
          <Button
            variant="secondary"
            fullWidth
            icon={<ExternalLink size={18} color={colors.slate[700]} />}
            iconPosition="right"
            onPress={handleOpenPortal}
          >
            Open Stripe Portal
          </Button>
        </Card>

        {/* Invoice History */}
        {billing?.invoices && billing.invoices.length > 0 && (
          <Card className="mb-4">
            <Card.Header>
              <Card.Title>Invoice History</Card.Title>
            </Card.Header>
            <Card.Content>
              <View className="gap-3">
                {billing.invoices.map((invoice) => (
                  <TouchableOpacity
                    key={invoice.id}
                    onPress={() => invoice.pdfUrl && handleViewInvoice(invoice.pdfUrl)}
                    disabled={!invoice.pdfUrl}
                    className="flex-row items-center py-2"
                  >
                    <View className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center">
                      <FileText size={18} color={colors.slate[600]} />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="text-base font-medium text-slate-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </Text>
                      <Text className="text-sm text-slate-500">
                        {formatDate(invoice.date, 'MMM d, yyyy')}
                      </Text>
                    </View>
                    <Badge 
                      variant={invoice.status === 'paid' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {invoice.status}
                    </Badge>
                  </TouchableOpacity>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
