defmodule ElixirBackendWeb.ShaderController do
  use ElixirBackendWeb, :controller
  alias ElixirBackend.ShaderService

  def generate(conn, %{"prompt" => prompt}) do
    case ShaderService.generate_shader(prompt) do
      {:ok, shader_code} ->
        json(conn, %{shader_code: shader_code})
      {:error, reason} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{error: reason})
    end
  end
end
