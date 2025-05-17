def categorize_transaction(description: str) -> tuple[str, str]:
    description = description.lower()

    keyword_map = {
        "Income": ["salary", "payroll", "deposit", "bonus"],
        "Food": ["grocery", "supermarket", "food", "restaurant"],
        "Transport": ["uber", "lyft", "transport", "bus", "subway"],
        "Housing": ["rent", "mortgage", "housing"],
        "Entertainment": ["netflix", "spotify", "entertainment", "movie"]
    }

    for category, keywords in keyword_map.items():
        for keyword in keywords:
            if keyword in description:
                return keyword.title(), category

    return "Other", "Other"