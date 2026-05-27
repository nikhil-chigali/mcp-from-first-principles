from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration settings for the MCP server."""

    data_dir: Path = (
        Path(__file__).parent.parent.resolve() / "data"
    )  # Directory to store downloaded papers
    papers_dir: Path = data_dir / "papers"  # Directory to store parsed paper contents
    hf_papers_of_the_day_url: str = (
        "https://huggingface.co/papers/date/{date}"  # URL template for fetching top papers of the day
    )
    hf_base_url: str = (
        "https://huggingface.co{href}"  # URL template for fetching individual paper details
    )


settings = Settings()
