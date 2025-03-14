defmodule ElixirBackend.ShaderService do
  require Logger

  @timeout 30_000  # 30 seconds timeout

  defp cf_api_url do
    "https://gateway.ai.cloudflare.com/v1/#{System.get_env("CF_ACCOUNT_ID")}/invideo/workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast"
  end

  def generate_shader(prompt) do
    full_prompt = """
    You are an expert WebGL 2.0 shader developer. Generate a **WebGL 2.0-compatible fragment shader** based on the following description: #{prompt}.

    ### **Requirements**:
    1. The shader **must be fully compatible with WebGL 2.0**.
    2. **Start with** `#version 300 es` and `precision highp float;`.
    3. **Define and use** the following uniforms:
      - `uniform float time;` → Enables animation over time.
      - `uniform vec2 resolution;` → Ensures correct aspect ratio and scaling.
    4. **Use `out vec4 fragColor;` instead of `gl_FragColor`.**
    5. The shader **must output dynamic visuals**:
      - It should **animate over time** (`time`).
      - It should **adapt to screen size** (`resolution`).
    6. **Avoid static or single-color shaders.**
    7. **Return only the complete shader code, no explanations or other text.**
    """

    headers = [
      {"Authorization", "Bearer #{System.get_env("CF_TOKEN")}"},
      {"Content-Type", "application/json"}
    ]

    body = Jason.encode!(%{
      prompt: full_prompt,
      max_tokens: 1024,
    })

    Logger.info("Sending request to Cloudflare API with prompt: #{full_prompt}")

    case HTTPoison.post(cf_api_url(), body, headers, [timeout: @timeout, recv_timeout: @timeout]) do
      {:ok, %{status_code: 200, body: response_body}} ->
        Logger.info("Received response: #{response_body}")
        handle_cf_response(response_body)
      {:ok, %{status_code: status_code, body: response_body}} ->
        Logger.error("API request failed with status #{status_code}: #{response_body}")
        {:error, "API request failed with status #{status_code}"}
      {:error, %HTTPoison.Error{reason: :timeout}} ->
        Logger.error("API request timed out after #{@timeout}ms")
        {:error, "Request timed out. Please try again."}
      {:error, %HTTPoison.Error{reason: reason}} ->
        Logger.error("HTTP request failed: #{inspect(reason)}")
        {:error, "Request failed: #{inspect(reason)}"}
    end
  end

  defp handle_cf_response(response_body) do
    case Jason.decode(response_body) do
      {:ok, decoded} ->
        Logger.info("Decoded response: #{inspect(decoded)}")
        case decoded do
          %{"result" => %{"response" => shader_code}} ->
            clean_shader_code = shader_code
              |> String.split("\n")
              |> Enum.drop_while(fn line -> not String.contains?(line, "precision") end)
              |> Enum.take_while(fn line -> not String.contains?(line, "```") end)
              |> Enum.join("\n")
              |> String.trim()
            {:ok, clean_shader_code}
          _ ->
            Logger.error("Unexpected response structure: #{inspect(decoded)}")
            {:error, "Unexpected response structure from API"}
        end
      {:error, error} ->
        Logger.error("JSON decode error: #{inspect(error)}")
        {:error, "Failed to parse API response"}
    end
  end
end
