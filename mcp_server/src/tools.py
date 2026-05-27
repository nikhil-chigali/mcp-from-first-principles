from typing import Any, Dict, List
import os
import re
import arxiv
from datetime import datetime
from urllib.request import urlretrieve
import pymupdf4llm
from bs4 import BeautifulSoup
import requests

from loguru import logger
from src.config import settings  # pyrefly: ignore [missing-import]


def extract_id(id_or_url: str) -> str:
    """Extracts the arxiv id from a url or id string"""
    regex = r"(?:https?://)?arxiv\.org/(?:abs|pdf)/(\d+\.\d+)(?:v\d+)?"
    match = re.match(regex, id_or_url)
    if match:
        return match.group(1)
    return id_or_url


def download_pdf(id: str) -> str:
    """Downloads the PDF for a given paper and saves it to the data/pdfs directory"""
    client = arxiv.Client()
    search_by_id = arxiv.Search(id_list=[id])
    paper = list(client.results(search_by_id))
    if not paper:
        raise ValueError(f"Paper with id {id} not found")
    paper = paper[0]

    if not os.path.isdir(f"{settings.papers_dir / 'pdfs'}"):
        os.makedirs(f"{settings.papers_dir / 'pdfs'}", exist_ok=True)

    # Check if the PDF already exists before downloading
    if os.path.isfile(f"{settings.papers_dir / 'pdfs' / id}.pdf"):
        return "exists"

    # Download the PDF and save it to the data/pdfs directory
    urlretrieve(paper.pdf_url, f"{settings.papers_dir / 'pdfs' / id}.pdf")
    return "success"


def parse_pdf_to_markdown(id: str) -> str:
    """Parses the PDF for a given paper to extract its contents as markdown and saves it to the data/papers/markdowns directory"""
    if not os.path.isdir(f"{settings.papers_dir / 'markdowns'}"):
        os.makedirs(f"{settings.papers_dir / 'markdowns'}", exist_ok=True)

    # Check if the markdown already exists before parsing
    if os.path.isfile(f"{settings.papers_dir / 'markdowns' / id}.md"):
        return "exists"

    # Parse the PDF to extract its contents as markdown and save it to the data/markdowns directory
    md = pymupdf4llm.to_markdown(f"{settings.papers_dir / 'pdfs' / id}.pdf")
    with open(
        f"{settings.papers_dir / 'markdowns' / id}.md", "w", encoding="utf-8"
    ) as f:
        f.write(md)
    return "success"


def fetch_top5_papers_of_the_day() -> List[Dict[str, Any]]:
    """Fetches the top 5 papers of the day from Huggingface Papers and returns them as a list of dictionaries"""
    current_date = datetime.now().strftime("%Y-%m-%d")
    url = settings.hf_papers_of_the_day_url.format(date=current_date)
    response = requests.get(url)
    if response.status_code != 200:
        raise ValueError(f"Failed to fetch papers of the day: {response.status_code}")

    soup = BeautifulSoup(response.content, "html.parser")
    papers = []
    for paper in soup.find_all(
        "a", {"class": "line-clamp-3 cursor-pointer text-balance"}
    )[:5]:
        papers.append(
            {
                "title": paper.text.strip(),
                "url": settings.hf_base_url.format(href=paper["href"]),
                "id": paper["href"].split("/")[-1],
            }
        )

    return papers


def get_metadata_for_paper(paper: Dict[str, Any]) -> Dict[str, Any]:
    """Fetches the metadata for a single paper and adds it to the paper dictionary"""
    response = requests.get(paper["url"])
    if response.status_code != 200:
        logger.warning(
            f"Failed to fetch paper details for {paper['id']}: {response.status_code}"
        )

    soup = BeautifulSoup(response.content, "html.parser")

    # Extract the Authors
    authors_block = soup.find_all(
        "div",
        {"class": "relative flex flex-wrap items-center gap-2 text-base leading-tight"},
    )
    for block in authors_block:
        paper["authors"] = [
            author.strip() for author in block.text.strip("Authors:").split(",")
        ]

    # Extract the Abstract
    abstract = soup.find_all("p", {"class": "text-gray-600"})[0].text.strip()
    paper["abstract"] = abstract

    return paper
