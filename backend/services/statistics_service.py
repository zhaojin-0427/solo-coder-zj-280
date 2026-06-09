from repositories.statistics_repository import StatisticsRepository


class StatisticsService:
    def __init__(self):
        self.repository = StatisticsRepository()

    def get_overview(self):
        return self.repository.get_overview()

    def get_pitch_ranges(self):
        return self.repository.get_pitch_ranges()

    def get_popular_chords(self):
        return self.repository.get_popular_chords()

    def get_material_usage(self):
        return self.repository.get_material_usage()

    def get_tuning_corrections(self):
        return self.repository.get_tuning_corrections()
