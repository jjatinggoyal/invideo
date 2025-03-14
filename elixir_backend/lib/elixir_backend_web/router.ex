defmodule ElixirBackendWeb.Router do
  use ElixirBackendWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug CORSPlug, origin: [System.get_env("CORS_ORIGIN") || "http://localhost:5173"]
  end

  scope "/api", ElixirBackendWeb do
    pipe_through :api
    get "/up", ShaderController, :health_check
    post "/generate_shader", ShaderController, :generate
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:elixir_backend, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: ElixirBackendWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
