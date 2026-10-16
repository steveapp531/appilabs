import unittest

from appilabs_automation import reports


class ReportTests(unittest.TestCase):
    def test_money(self):
        self.assertEqual(reports.money(180000), "GHS 1,800")
        self.assertEqual(reports.money(12345), "GHS 123.45")

    def test_stale_report_lists_items(self):
        data = {"thresholdHours": 48, "total": 1, "leads": [{"ageHours": 60, "name": "Ama", "email": "a@x.com", "pillar": "solutions", "type": "project"}], "researchRequests": []}
        title, body = reports.stale_report(data)
        self.assertIn("1 inquiries", title)
        self.assertIn("| 60 h | Ama |", body)

    def test_stale_report_empty(self):
        title, _ = reports.stale_report({"thresholdHours": 48, "total": 0, "leads": [], "researchRequests": []})
        self.assertEqual(title, "No inquiries are waiting for a reply")

    def test_enrollment_report_revenue(self):
        data = {"windowDays": 30, "total": 2, "revenueMinor": 180000, "currency": "GHS", "byCourse": {"Power BI": {"total": 2, "paid": 1, "pending_payment": 1, "revenue": 180000}}}
        title, body = reports.enrollment_report(data)
        self.assertIn("GHS 1,800", title)
        self.assertIn("awaiting payment", body)


if __name__ == "__main__":
    unittest.main()
