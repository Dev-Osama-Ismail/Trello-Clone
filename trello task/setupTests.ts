class MockBroadcastChannel {
    name: string;
    onmessage: ((event: MessageEvent) => void) | null = null;
  
    constructor(name: string) {
      this.name = name;
    }
  
    postMessage(message: any) {
      if (this.onmessage) {
        this.onmessage({ data: message } as MessageEvent);
      }
    }
  
    close() {}
  
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
  }
  
  (global as any).BroadcastChannel = MockBroadcastChannel;
  