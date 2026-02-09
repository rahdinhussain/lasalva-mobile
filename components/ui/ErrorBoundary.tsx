import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
}

/**
 * Catches JavaScript errors in the child tree and shows a fallback UI.
 * Prevents the whole app from showing a blank screen in production.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.error('[ErrorBoundary]', error, errorInfo.componentStack);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError && this.props.fallback) {
      return this.props.fallback;
    }

    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-slate-50 justify-center items-center px-6">
          <Text className="text-lg font-semibold text-slate-900 text-center mb-2">
            Something went wrong
          </Text>
          <Text className="text-slate-500 text-center mb-6">
            We're sorry. Please try again or restart the app.
          </Text>
          <TouchableOpacity
            onPress={this.handleReset}
            className="bg-indigo-600 px-6 py-3 rounded-xl active:opacity-80"
          >
            <Text className="text-white font-medium">Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
