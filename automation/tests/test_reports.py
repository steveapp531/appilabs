import unittest
from unittest.mock import patch

from appilabs_automation import reports
from app import app


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

    def test_cron_endpoint_rejects_unauthorized_requests(self):
        with patch.dict("os.environ", {"CRON_SECRET": "test-secret"}):
            response = self._invoke({"REQUEST_METHOD": "GET"})

        self.assertEqual(response[0], "401 Unauthorized")

    def test_cron_endpoint_requires_a_configured_secret(self):
        with patch.dict("os.environ", {}, clear=True):
            response = self._invoke({"REQUEST_METHOD": "GET"})

        self.assertEqual(response[0], "503 Service Unavailable")

    def test_cron_endpoint_runs_reports_and_upload_cleanup(self):
        with patch.dict("os.environ", {"CRON_SECRET": "test-secret"}):
            with patch("app.main", return_value=0) as run_job:
                response = self._invoke(
                    {
                        "REQUEST_METHOD": "GET",
                        "HTTP_AUTHORIZATION": "Bearer test-secret",
                    }
                )

        self.assertEqual(response[0], "200 OK")
        self.assertEqual(run_job.call_args_list[0].args[0], ["all", "--notify", "smtp"])
        self.assertEqual(run_job.call_args_list[1].args[0], ["purge-uploads"])

    @staticmethod
    def _invoke(environ):
        result = {}

        def start_response(status, _headers):
            result["status"] = status

        body = b"".join(app(environ, start_response))
        return result["status"], body


if __name__ == "__main__":
    unittest.main()
