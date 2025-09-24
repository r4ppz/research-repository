export interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
  client_id?: string;
}

export interface GoogleAccounts {
  id: {
    initialize: (options: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
    }) => void;
    renderButton: (
      parent: HTMLElement,
      options: {
        theme?: "outline" | "filled_blue" | "filled_black";
        size?: "small" | "medium" | "large";
        type?: "standard" | "icon";
        shape?: "rect" | "pill" | "circle" | "square";
        logo_alignment?: "left" | "center";
        width?: number;
      }
    ) => void;
    prompt: () => void;
  };
}
