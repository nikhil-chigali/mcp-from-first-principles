"""
Resources (3):
papers://list — direct, JSON, full metadata for saved papers.
papers://{id}/pdf — templated, application/pdf.
papers://{id}/markdown — templated, text/markdown.

Prompts (2):
/explain {arxiv_id} — looks up the paper, frames an "explain to a junior researcher" message.
/newsletter — fetches top-N papers internally, frames a newsletter generation request.
"""

from typing import List, Dict, Any
from mcp.server.fastmcp import FastMCP
from loguru import logger

# pyrefly: ignore [missing-import]
from src.tools import (
    fetch_top5_papers_of_the_day,
    get_metadata_for_paper,
    extract_id,
    download_pdf,
    parse_pdf_to_markdown,
)

mcp = FastMCP("Arxiv Book Shelf")


@mcp.tool()
def top5_papers_of_the_day() -> List[Dict[str, Any]]:
    """Fetches top 5 papers of the day from `Huggingface Papers` as JSON"""
    # Fetch the top 5 papers of the day
    papers = fetch_top5_papers_of_the_day()

    # For each paper, fetch its authors and abstract
    for i, paper in enumerate(papers):
        logger.info(f"Fetching metadata for paper #{i + 1}: {paper['id']}")
        papers[i] = get_metadata_for_paper(paper)
    return papers


@mcp.tool()
def save_arxiv(id_or_url: str):
    """Fetches the paper from arxiv as pdf, parses it to extract its contents as markdown and saves both to the data/papers directory"""
    # Extract the arxiv id from the input
    id = extract_id(id_or_url)
    logger.info(f"Fetching paper with id {id}")

    # Download the PDF for the paper and save it to the data/papers/pdfs directory
    status = download_pdf(id)
    if status == "success":
        logger.info(f"Downloaded PDF for paper {id}")
    elif status == "exists":
        logger.info(f"PDF for paper {id} already exists, skipping download")

    # Parse the PDF to extract its contents as markdown and save it to the data/papers/markdowns directory
    status = parse_pdf_to_markdown(id)
    if status == "success":
        logger.info(f"Parsed PDF for paper {id} to markdown")
    elif status == "exists":
        logger.info(f"Markdown for paper {id} already exists, skipping parsing")


if __name__ == "__main__":
    mcp.run()
