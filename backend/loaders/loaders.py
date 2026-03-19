from langchain_community.document_loaders import PyPDFLoader, CSVLoader, TextLoader, UnstructuredExcelLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os

def get_loader(file_path, file_type):
    if file_type == "pdf":
        return PyPDFLoader(file_path)
    elif file_type == "csv":
        return CSVLoader(file_path)
    elif file_type == "txt":
        return TextLoader(file_path)
    elif file_type == "xlsx" or file_type == "xls":
        return UnstructuredExcelLoader(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

def process_document(file_path, file_type):
    loader = get_loader(file_path, file_type)
    documents = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    return chunks
