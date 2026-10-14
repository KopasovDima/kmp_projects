from is_kmp.models.company import Company


def get_company_with_all_children(company_id):
    if not company_id:
        return []

    company = Company.objects.get(id=company_id)
    all_companies = Company.objects.all().order_by('id')

    companies = [company]
    processed_ids = {company_id}

    while True:
        new_children = [
            c for c in all_companies
            if c.parent_id in processed_ids and c.id not in processed_ids
        ]

        if not new_children:
            break

        companies.extend(new_children)
        processed_ids.update(c.id for c in new_children)

    return companies
